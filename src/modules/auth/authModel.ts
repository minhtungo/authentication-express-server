import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const VerifyEmailSchema = z.object({
  token: z.string(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  code: z.string().optional(),
});
