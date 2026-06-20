import { z } from "zod";

export * from "./generated/api";
export * from "./generated/types";

export const AdminLoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ChangePasswordBody = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const ForgotPasswordBody = z.object({
  email: z.string().email(),
});

export const ResetPasswordBody = z.object({
  token: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});

export const CreateAdminBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.coerce.number().int().positive().nullable().optional(),
  status: z.string().min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const UpdateAdminBody = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  roleId: z.coerce.number().int().positive().nullable().optional(),
  status: z.string().min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
}).partial();

export const GetAdminParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const UpdateAdminParams = GetAdminParams;
export const DeleteAdminParams = GetAdminParams;
export const UpdateAdminStatusParams = GetAdminParams;

export const UpdateAdminStatusBody = z.object({
  status: z.string().min(1),
});
