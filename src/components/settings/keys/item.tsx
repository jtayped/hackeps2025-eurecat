"use client";

import React from "react";
import { Trash2, KeyRound, MapPin, Cloud, Server } from "lucide-react";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Provider } from "@/generated/prisma/enums";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CredentialItem = RouterOutputs["credentials"]["list"][number];

interface KeyItemProps {
  credential: CredentialItem;
}

const KeyItem = ({ credential }: KeyItemProps) => {
  const utils = api.useUtils();

  const deleteMutation = api.credentials.delete.useMutation({
    onSuccess: async () => {
      toast.success("Credential deleted");
      await utils.credentials.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const isDeleting = deleteMutation.isPending;
  const isAWS = credential.provider === Provider.AWS;

  return (
    <Card className="group hover:border-primary/50 flex items-center justify-between p-4 transition-all hover:shadow-sm">
      <div className="flex items-center gap-5">
        {/* Provider Icon - Fixed Width & Thematic Colors */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 ${
            isAWS
              ? "border-orange-100 bg-orange-50/50 text-orange-600 dark:border-orange-900/30 dark:bg-orange-900/10"
              : "border-blue-100 bg-blue-50/50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/10"
          }`}
        >
          {isAWS ? (
            <Cloud className="h-6 w-6" />
          ) : (
            <Server className="h-6 w-6" />
          )}
        </div>

        {/* Main Content Block */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h4 className="leading-none font-semibold tracking-tight">
              {credential.name}
            </h4>
            <Badge
              variant="secondary"
              className={`text-[10px] font-medium tracking-wide ${
                isAWS
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {credential.provider}
            </Badge>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 opacity-70" />
              <span className="text-xs font-medium">{credential.region}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 opacity-70" />
              <span className="font-mono text-xs opacity-80">
                ID: ••••{credential.id.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Right Aligned */}
      <div className="pl-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                // Hides button by default on desktop until hover for cleaner look
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9 transition-colors md:opacity-0 md:group-hover:opacity-100"
                disabled={isDeleting}
                onClick={() => deleteMutation.mutate({ id: credential.id })}
              >
                {isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Trash2 className="h-4.5 w-4.5" />
                )}
                <span className="sr-only">Delete credential</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Delete Credential</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};

export default KeyItem;
