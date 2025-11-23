import { api } from "@/trpc/server";
import React from "react";

const ClusterPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: clusterId } = await params;
  const cluster = await api.cluster.getStatus({ clusterId });

  return <div>{cluster.cluster.name}</div>;
};

export default ClusterPage;
