import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Provider } from "@/generated/prisma/enums";
import type { CredentialsCreateType } from "@/validators/credentials";
import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

const ProviderField = ({
  form,
}: {
  form: UseFormReturn<CredentialsCreateType>;
}) => {
  return (
    <Controller
      control={form.control}
      name="provider"
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Provider</FieldLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Provider.AWS}>AWS</SelectItem>
              <SelectItem value={Provider.GCP}>GCP</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            Choose the provider for this credential
          </FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default ProviderField;
