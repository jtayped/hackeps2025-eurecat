/*
  Warnings:

  - The values [NOMAD,KUBERNETES] on the enum `ClusterSoftware` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClusterSoftware_new" AS ENUM ('K3S', 'DOCKER_SWARM');
ALTER TABLE "Cluster" ALTER COLUMN "clusterSoftware" TYPE "ClusterSoftware_new" USING ("clusterSoftware"::text::"ClusterSoftware_new");
ALTER TYPE "ClusterSoftware" RENAME TO "ClusterSoftware_old";
ALTER TYPE "ClusterSoftware_new" RENAME TO "ClusterSoftware";
DROP TYPE "public"."ClusterSoftware_old";
COMMIT;
