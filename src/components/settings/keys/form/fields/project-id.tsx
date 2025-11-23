import type { CredentialsCreateType } from "@/validators/credentials";
import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Cloud } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

const ProjectIdField = ({
  form,
}: {
  form: UseFormReturn<CredentialsCreateType>;
}) => {
  return (
    <Controller
      control={form.control}
      name="projectId"
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Project ID</FieldLabel>
          <InputGroup className="mt-0">
            <InputGroupAddon>
              <Cloud className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="my-gcp-project-id"
              {...field}
              // Handling the case where field value might be undefined initially
              value={field.value ?? ""}
            />
          </InputGroup>
          <FieldDescription>
            Provide a concise name for your credential
          </FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default ProjectIdField;
