import Cluster from "@/components/clusters";
import { api } from "@/trpc/server";
import React from "react";

const ClusterPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: clusterId } = await params;
  const cluster = await api.cluster.getStatus({ clusterId });

  return <Cluster cluster={cluster} />;
};

export default ClusterPage;
