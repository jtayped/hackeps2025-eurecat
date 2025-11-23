-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_clusterId_fkey";

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
