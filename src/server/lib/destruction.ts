import { db } from "@/server/db";
import { Provider, Status } from "@/generated/prisma/enums";
import { terminateAwsInstance } from "./aws";
import { deleteGcpInstance } from "./gcp";

export async function destroyCluster(clusterId: string) {
  console.log(`[Destruction] Starting cleanup for cluster ${clusterId}`);

  // 1. Fetch Cluster and Nodes with Credentials
  const cluster = await db.cluster.findUnique({
    where: { id: clusterId },
    include: {
      Nodes: {
        include: {
          credential: true,
        },
      },
    },
  });

  if (!cluster) return;

  // 2. Iterate and Destroy Cloud Resources
  for (const node of cluster.Nodes) {
    // If the node has a machineId (meaning it was created on the cloud), we try to delete it
    if (node.machineId && node.status !== Status.FAILED) {
      try {
        if (node.provider === Provider.AWS && node.credential) {
          await terminateAwsInstance(
            {
              region: node.credential.region,
              accessKeyId: node.credential.accessKey,
              secretAccessKey: node.credential.secretKey!,
            },
            node.machineId,
          );
        } else if (node.provider === Provider.GCP && node.credential) {
          await deleteGcpInstance(
            {
              projectId: node.credential.projectId!,
              credentialsJson: node.credential.accessKey,
              zone: `${node.credential.region}-b`, // Assuming same convention as provisioning
            },
            node.machineId,
          );
        } else if (node.provider === Provider.EDGE) {
          console.log(`[Edge] Unlinking edge device ${node.name}`);
          // No physical destruction needed for Edge, just DB unlinking
        }
      } catch (e) {
        console.error(`[Destruction] Failed to destroy node ${node.name}`, e);
        // Continue to next node even if this one fails
      }
    }
  }

  // 3. Final DB Cleanup
  // Delete the Cluster record (Cascades to Nodes)
  await db.cluster.delete({
    where: { id: clusterId },
  });

  console.log(`[Destruction] Cluster ${clusterId} deleted from DB.`);
}
