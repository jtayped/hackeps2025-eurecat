import { api } from "@/trpc/server";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Server,
  Box,
  Cpu,
  Activity,
  ArrowRight,
} from "lucide-react";
import { ClusterSoftware } from "@/generated/prisma/enums";
import { getStatusBadge } from "../ui/status";


// Helper for Software Icons
const SoftwareIcon = ({ type }: { type: ClusterSoftware }) => {
  if (type === ClusterSoftware.K3S) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
        <span className="text-xs font-bold">K3S</span>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm">
      <Box className="h-6 w-6" />
    </div>
  );
};

const Dashboard = async () => {
  const data = await api.cluster.list();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clusters</h1>
          <p className="text-muted-foreground mt-1">
            Manage your multi-cloud and edge infrastructure.
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="gap-2 shadow-lg transition-all hover:shadow-xl">
            <Plus className="h-4 w-4" /> Create Cluster
          </Button>
        </Link>
      </div>

      {/* Grid Content */}
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((cluster) => (
            <Card
              key={cluster.id}
              className="group hover:border-primary/50 relative overflow-hidden transition-all hover:shadow-md"
            >
              <div className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <SoftwareIcon type={cluster.clusterSoftware} />
                  <div className="space-y-1">
                    <p className="text-base leading-none font-semibold">
                      {cluster.name}
                    </p>
                    <p className="truncate text-xs">ID: {cluster.id}</p>
                  </div>
                </div>
                {getStatusBadge(cluster.status)}
              </div>

              <div className="mt-4 grid gap-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    <span>Total Nodes</span>
                  </div>
                  <span className="font-medium">{cluster._count.Nodes}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Orchestrator</span>
                  </div>
                  <span className="font-medium">
                    {cluster.clusterSoftware === ClusterSoftware.K3S
                      ? "Kubernetes (K3s)"
                      : "Docker Swarm"}
                  </span>
                </div>
              </div>

              <div className="px-6 pb-2">
                <div className="bg-border h-px w-full" />
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-muted-foreground text-xs">
                  {/* Fallback to date string if date-fns not installed */}
                  Created {cluster.createdAt.toLocaleDateString()}
                </span>

                <Link href={`/dashboard/cluster/${cluster.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary gap-1"
                  >
                    Manage <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="bg-muted/40 animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
        <Cpu className="text-muted-foreground/50 h-10 w-10" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">No clusters found</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        You haven&apos;t provisioned any clusters yet. Start by creating a set
        of cloud or edge nodes.
      </p>
      <Link href="/dashboard/new">
        <Button variant="secondary" className="mt-8">
          Provision your first cluster
        </Button>
      </Link>
    </div>
  );
};

export default Dashboard;
