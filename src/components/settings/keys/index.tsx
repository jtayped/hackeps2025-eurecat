"use client";

import { api } from "@/trpc/react";
import React from "react";
import KeysForm from "./form";
import KeyItem from "./item";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";

const KeySettings = () => {
  const { data: keys, isLoading } = api.credentials.list.useQuery();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h2 className="text-lg font-medium">Cloud Credentials</h2>
        <p className="text-muted-foreground text-sm">
          Manage your AWS and Google Cloud access keys here. These are used to
          provision nodes.
        </p>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading Skeletons
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : keys?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <ShieldAlert className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">No credentials found</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              You haven&apos;t added any cloud provider keys yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {keys?.map((k) => (
              <KeyItem key={k.id} credential={k} />
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Add New Key
          </span>
        </div>
      </div>

      {/* Form Section */}
      <KeysForm />
    </div>
  );
};

export default KeySettings;
