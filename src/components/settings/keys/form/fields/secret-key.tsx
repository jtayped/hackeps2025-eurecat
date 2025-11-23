import type { CredentialsCreateType } from "@/validators/credentials";
import React, { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeOff, Lock } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

const SecretKeyField = ({
  form,
}: {
  form: UseFormReturn<CredentialsCreateType>;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Controller
      control={form.control}
      name="secretKey"
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Secret Access Key</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Lock className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              type={isVisible ? "text" : "password"}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className="font-mono"
              {...field}
              value={field.value ?? ""}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                aria-label={isVisible ? "Hide password" : "Show password"}
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            Provide your AWS secret access key
          </FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default SecretKeyField;
