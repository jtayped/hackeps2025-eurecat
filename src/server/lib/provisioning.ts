import { db } from "@/server/db";
import { generateSSHKeyPair } from "./keys";
import { createAwsInstance, getAwsPublicIp } from "./aws";
import { createGcpInstance } from "./gcp";
import { executeRemoteCommand, INSTALL_SCRIPTS } from "./ssh";
import { Provider, Status, ClusterSoftware } from "@/generated/prisma/enums";

export async function provisionCluster(clusterId: string) {
  console.log(`[Provisioning] Starting for cluster ${clusterId}`);

  // 1. Fetch Cluster AND Node Credentials
  // We now include 'credential' inside Nodes, not on the Cluster itself
  const cluster = await db.cluster.findUnique({
    where: { id: clusterId },
    include: {
      Nodes: {
        include: {
          credential: true, // <--- Fetch the credential specific to this node
          edgeDevice: true, // <--- Fetch edge details if applicable
        },
      },
    },
  });

  if (!cluster) return;

  // 2. Generate KeyPair (One key for the whole cluster to simplify management)
  const { publicKey, privateKey } = await generateSSHKeyPair();

  // Save Private Key to DB immediately so we don't lose access
  await db.cluster.update({
    where: { id: clusterId },
    data: { sshPrivateKey: privateKey },
  });

  // 3. Provision Nodes
  for (const node of cluster.Nodes) {
    try {
      await db.node.update({
        where: { id: node.id },
        data: { status: Status.PROVISIONING },
      });

      let machineId = "";
      let publicIp = "";

      // --- EDGE DEVICE HANDLING ---
      if (node.provider === Provider.EDGE) {
        if (!node.edgeDevice) {
          throw new Error("Edge node missing linked device information.");
        }
        // For Edge, we don't "create" a machine. We just use the existing IP.
        // We treat the Edge IP as the 'publicIp' for SSH purposes here.
        publicIp = node.edgeDevice.ipAddress;
        machineId = "edge-" + node.edgeDevice.id;

        console.log(`[Edge] Using existing device at ${publicIp}`);
      }

      // --- AWS HANDLING ---
      else if (node.provider === Provider.AWS) {
        if (!node.credential) throw new Error("AWS Node missing credentials");

        const result = await createAwsInstance(
          {
            region: node.credential.region,
            accessKeyId: node.credential.accessKey,
            secretAccessKey: node.credential.secretKey!,
          },
          {
            instanceType: node.instanceType,
            nameTag: node.name,
            publicKey: publicKey,
          },
        );
        machineId = result.instanceId!;

        console.log(`[AWS] Waiting for IP assignment for ${machineId}...`);
        // In a real app, use a loop with exponential backoff.
        // For hackathon, a hard 10-15s wait usually works for AWS to assign IP.
        await new Promise((r) => setTimeout(r, 15000));

        const ip = await getAwsPublicIp(
          {
            region: node.credential.region,
            accessKeyId: node.credential.accessKey,
            secretAccessKey: node.credential.secretKey!,
          },
          machineId,
        );
        publicIp = ip ?? "";
      }

      // --- GCP HANDLING ---
      else if (node.provider === Provider.GCP) {
        if (!node.credential) throw new Error("GCP Node missing credentials");

        // 1. Generate a unique name to prevent "Already Exists" 409 errors
        const randomSuffix = Math.floor(Math.random() * 10000);
        const uniqueName = `${node.name.toLowerCase()}-${randomSuffix}`;

        const result = await createGcpInstance(
          {
            projectId: node.credential.projectId!,
            credentialsJson: node.credential.accessKey,
            zone: `${node.credential.region}-b`,
          },
          {
            name: uniqueName, // <--- USE UNIQUE NAME HERE
            machineType: node.instanceType,
            publicKey: publicKey,
          },
        );
        machineId = result.instanceName;

        console.log(`[GCP] Created instance ${machineId}`);
      }

      // 4. Update Node in DB with IP and Active Status
      await db.node.update({
        where: { id: node.id },
        data: {
          machineId,
          publicIp: publicIp,
          status: publicIp ? Status.ACTIVE : Status.FAILED,
        },
      });

      // 5. BOOTSTRAP (Install Software)
      // We only run this if we have an IP.
      if (publicIp) {
        console.log(`[Bootstrap] Installing software on ${publicIp}...`);

        // Wait for SSH to be ready (VM boot time)
        // Edge devices are already running, so we can lower timeout for them,
        // but Cloud VMs need time to boot Linux.
        const waitTime = node.provider === Provider.EDGE ? 1000 : 25000;
        await new Promise((r) => setTimeout(r, waitTime));

        let commands: string[] = [];

        // Determine commands based on software selection
        if (cluster.clusterSoftware === ClusterSoftware.DOCKER_SWARM) {
          commands = INSTALL_SCRIPTS.DOCKER_SWARM;
        } else if (cluster.clusterSoftware === ClusterSoftware.K3S) {
          // Only install Master logic on Master nodes
          commands = node.isMaster ? INSTALL_SCRIPTS.K3S : [];
        }

        if (commands.length > 0) {
          // Use 'ubuntu' for cloud, or the saved sshUser for Edge
          const sshUser =
            node.provider === Provider.EDGE
              ? (node.edgeDevice?.sshUser ?? "root")
              : "ubuntu";

          // Use the private key we just generated (Cloud)
          // OR the password/key stored for Edge (Edge logic omitted for brevity, assuming key access)

          // IMPORTANT: This uses the generated key.
          // If using Edge, you would need to use the key/pass stored in EdgeDevice model.
          // For Cloud, this works perfectly.
          if (node.provider !== Provider.EDGE) {
            await executeRemoteCommand(publicIp, sshUser, privateKey, commands);
          } else {
            console.log(
              "[Bootstrap] Skipping auto-install on Edge (manual setup required for hackathon)",
            );
          }
        }
      }
    } catch (e) {
      console.error(`Failed node ${node.name}`, e);
      await db.node.update({
        where: { id: node.id },
        data: { status: Status.FAILED },
      });
    }
  }

  // 6. Mark Cluster as Active
  await db.cluster.update({
    where: { id: clusterId },
    data: { status: Status.ACTIVE },
  });

  console.log(`[Provisioning] Cluster ${clusterId} is ready.`);
}
