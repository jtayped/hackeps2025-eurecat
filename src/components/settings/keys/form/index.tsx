"use client";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { api } from "@/trpc/react";
import {
  credentialsSchema,
  type CredentialsCreateType,
} from "@/validators/credentials";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import NameField from "./fields/name";
import RegionField from "./fields/region";
import ProviderField from "./fields/provider";
import AccessKeyField from "./fields/access-key";
import SecretKeyField from "./fields/secret-key";
import ProjectIdField from "./fields/project-id";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";

const KeysForm = () => {
  const utils = api.useUtils();

  const form = useForm<CredentialsCreateType>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      provider: "GCP",
      name: "",
      region: "us-central1",
      accessKey: "",
      secretKey: undefined,
      projectId: undefined,
    },
  });

  const credentialsMutation = api.credentials.create.useMutation({
    onSuccess() {
      form.reset();
      toast.success("Your crededential has been recorded!");
      void utils.credentials.list.invalidate();
    },
    onError() {
      toast.error("There has been an error creating the credential :(");
    },
  });

  async function onSubmit(data: CredentialsCreateType) {
    await credentialsMutation.mutateAsync(data);
  }

  const provider = form.watch("provider");
  const isAWS = provider === "AWS";
  const isGCP = provider === "GCP";

  useEffect(() => {
    form.setValue("region", provider === "AWS" ? "us-west-2" : "us-central1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Card className="p-6">
            <div className="grid gap-6">
              {/* Top Row: Basic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <NameField form={form} />
                <ProviderField form={form} />
              </div>

              {/* Middle Row: Context specific info */}
              <div className="grid gap-6 md:grid-cols-2">
                <RegionField form={form} />
                {isGCP && <ProjectIdField form={form} />}
              </div>

              {/* Bottom Section: Auth Keys */}
              {isAWS && (
                <div className="grid gap-6 md:grid-cols-2">
                  <AccessKeyField form={form} />
                  <SecretKeyField form={form} />
                </div>
              )}

              {isGCP && (
                <div className="grid gap-6 md:grid-cols-1">
                  {/* GCP Key is usually a JSON blob, so give it full width */}
                  <AccessKeyField form={form} />
                </div>
              )}

              {!provider && (
                <div className="text-muted-foreground rounded-md border border-dashed py-4 text-center text-sm">
                  Please select a provider to continue configuration.
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create credential
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </FieldGroup>
      </form>
    </Form>
  );
};

export default KeysForm;
