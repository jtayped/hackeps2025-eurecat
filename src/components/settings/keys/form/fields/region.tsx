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

const RegionField = ({
  form,
}: {
  form: UseFormReturn<CredentialsCreateType>;
}) => {
  const provider = form.watch("provider");
  return (
    <Controller
      name="region"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{provider} Region</FieldLabel>
          <Input
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder="Login button not working on mobile"
            autoComplete="off"
            disabled
          />
          <FieldDescription>
            Provide the region of the credential
          </FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default RegionField;
