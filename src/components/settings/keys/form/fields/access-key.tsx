import type { CredentialsCreateType } from "@/validators/credentials";
import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { KeyRound, FileJson } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

const AccessKeyField = ({
  form,
}: {
  form: UseFormReturn<CredentialsCreateType>;
}) => {
  const provider = form.watch("provider");
  const isGCP = provider === "GCP";

  return (
    <Controller
      control={form.control}
      name="accessKey"
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>
            {isGCP ? "Service Account Key (JSON)" : "Access Key ID"}
          </FieldLabel>
          <InputGroup>
            {isGCP ? (
              <>
                <InputGroupTextarea
                  placeholder='{ "type": "service_account", ... }'
                  className="min-h-[120px] font-mono text-xs"
                  {...field}
                />
                <InputGroupAddon align="block-start">
                  <FileJson className="text-muted-foreground h-4 w-4" />
                </InputGroupAddon>
              </>
            ) : (
              <>
                <InputGroupAddon>
                  <KeyRound className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="AKIA..."
                  className="font-mono"
                  {...field}
                />
              </>
            )}
          </InputGroup>
          <FieldDescription>Provide your AWS access key</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default AccessKeyField;
