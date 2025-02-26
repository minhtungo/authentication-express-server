import { commonValidations } from "@/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const SignUpSchema = z.object({
  email: commonValidations.email,
  password: commonValidations.password,
});

export const VerifyEmailSchema = z.object({
  token: z.string(),
});

export const ForgotPasswordSchema = z.object({
  email: commonValidations.email,
});

export const SignInSchema = z.object({
  email: commonValidations.email,
  password: z.string(),
  code: z.string().optional(),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: commonValidations.password,
});
