"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Icons
import { RefreshCw, Trash2, Loader2 } from "lucide-react";

const ClusterActions = ({
  cluster,
}: {
  cluster: RouterOutputs["cluster"]["getStatus"];
}) => {
  const router = useRouter();

  // 1. Delete Mutation
  const deleteMutation = api.cluster.delete.useMutation({
    onSuccess: () => {
      toast.success("Cluster deletion initiated");
      // Redirect to dashboard since this page will be empty/404 soon
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Failed to delete cluster: " + error.message);
    },
  });

  // 2. Refresh Logic
  const handleRefresh = () => {
    router.refresh(); // Re-runs the server component logic
  };

  return (
    <div className="flex items-center gap-3">
      {/* Refresh Button */}
      <Button variant="outline" size="sm" onClick={handleRefresh}>
        <RefreshCw className={`mr-2 h-4 w-4`} />
        Refresh Status
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Cluster
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              cluster{" "}
              <span className="text-foreground font-semibold">
                {cluster.cluster.name}
              </span>{" "}
              and terminate all associated cloud instances on AWS and GCP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteMutation.mutate({ clusterId: cluster.cluster.id })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Cluster"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClusterActions;
