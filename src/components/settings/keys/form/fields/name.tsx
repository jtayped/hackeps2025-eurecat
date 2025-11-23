import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CredentialsCreateType } from "@/validators/credentials";
import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

const NameField = ({
  form,
}: {
  form: UseFormReturn<CredentialsCreateType>;
}) => {
  return (
    <Controller
      name="name"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Credentials name</FieldLabel>
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="credential-123"
            autoComplete="off"
          />
          <FieldDescription>
            Provide a concise name for your credential
          </FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default NameField;
