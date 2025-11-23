import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";
import { deploymentSchema } from "@/validators/deployment";
import { executeRemoteCommand } from "@/server/lib/ssh";

export const deploymentRouter = createTRPCRouter({
  deploy: protectedProcedure
    .input(deploymentSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch Cluster, Master Node, AND the Private Key
      const cluster = await ctx.db.cluster.findUnique({
        where: { id: input.clusterId, userId: ctx.session.user.id },
        include: {
          Nodes: {
            where: { isMaster: true },
            include: { edgeDevice: true },
          },
        },
      });

      if (!cluster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cluster not found",
        });
      }

      if (cluster.status !== Status.ACTIVE) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cluster is not active yet.",
        });
      }

      // 2. Validate Keys
      if (!cluster.sshPrivateKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cluster has no private key saved. Cannot connect.",
        });
      }

      const masterNode = cluster.Nodes[0];
      if (!masterNode) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No master node found for this cluster.",
        });
      }

      // 3. Determine connection IP & User
      const targetIp =
        masterNode.publicIp ??
        masterNode.privateIp ??
        masterNode.edgeDevice?.ipAddress;

      if (!targetIp) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Master node has no reachable IP address.",
        });
      }

      const sshUser = "ubuntu"; // Assuming cloud for simplicity
      let commands: string[] = [];

      // PATH 1: KUBERNETES (K3S)
      if (input.payloadType === "K8S_MANIFEST") {
        const b64 = Buffer.from(input.payloadContent).toString("base64");
        const filename = `/tmp/deploy-${Date.now()}.yaml`;

        commands = [
          // Decode file
          `echo "${b64}" | base64 -d > ${filename}`,
          // Apply manifest
          `sudo k3s kubectl apply -f ${filename}`,
        ];
      }

      // PATH 2: DOCKER SWARM
      else if (input.payloadType === "DOCKER_IMAGE") {
        // In Swarm, we create a "Service", which is like a K8s Deployment
        // --name: Name of the service
        // --replicas 1: Run 1 copy
        // -p 80:80: Expose port 80
        commands = [
          `sudo docker service create --name ${input.deploymentName} --replicas 1 -p 80:80 ${input.payloadContent}`,
        ];
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payload type",
        });
      }

      console.log(`[Deployment] Connecting to ${sshUser}@${targetIp}...`);

      // 5. Execute SSH
      // We pass the actual private key from the DB here
      await executeRemoteCommand(
        targetIp,
        sshUser,
        cluster.sshPrivateKey,
        commands,
      );

      return {
        success: true,
        message: `Deployment of ${input.deploymentName} executed on Master Node (${targetIp})`,
      };
    }),
});
