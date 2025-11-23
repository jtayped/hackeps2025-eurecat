import type { RouterOutputs } from "@/trpc/react";
import { Cpu, Network, Terminal } from "lucide-react";
import React from "react";
import { getProviderIcon, getStatusBadge } from "../ui/status";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

const Node = ({
  node,
}: {
  node: RouterOutputs["cluster"]["getStatus"]["nodes"][number];
}) => {
  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-md ${
        node.isMaster ? "border-primary/40 bg-primary/5" : ""
      }`}
    >
      <div className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold">{node.name}</p>
            {node.isMaster && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                Master
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {getProviderIcon(node.provider)}
            <span>{node.provider}</span>
            {node.edgeDevice && <span>• {node.edgeDevice.name}</span>}
          </div>
        </div>
        {getStatusBadge(node.status)}
      </div>

      <div className="mt-4 space-y-4">
        {/* Hardware Specs */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Cpu className="h-3 w-3" /> Type
            </span>
            <p className="truncate font-medium" title={node.instanceType}>
              {node.instanceType}
            </p>
          </div>

          {/* IP Address */}
          <div className="space-y-0.5">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Network className="h-3 w-3" /> Public IP
            </span>
            <p className="truncate font-mono text-xs font-medium">
              {node.publicIp ?? "—"}
            </p>
          </div>
        </div>

        {/* Instance ID / Debug Info */}
        <div className="bg-muted/50 rounded-md p-2">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Terminal className="h-3 w-3" />
            <span className="truncate font-mono">
              {node.machineId ?? "Provisioning ID..."}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative corner for Master node */}
      {node.isMaster && (
        <div className="bg-primary/20 absolute top-0 right-0 -mt-8 -mr-8 h-12 w-20 rotate-45" />
      )}
    </Card>
  );
};

export default Node;
