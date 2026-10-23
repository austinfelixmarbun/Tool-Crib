import { z } from "zod";

export const CreateUserDto = z.object({
  workCenterId: z.number().int().positive(),
  workAreaId: z.number().int().positive(),
  employeeId: z.number().int().positive(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER ADMIN", "ADMIN", "QUALITY CONTROL", "USER"]).default("USER"),
  department: z.string().min(1).max(100),
});

export const UpdateUserDto = z.object({
  workCenterId: z.number().int().positive().optional(),
  workAreaId: z.number().int().positive().optional(),
  employeeId: z.number().int().positive().optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER ADMIN", "ADMIN", "QUALITY CONTROL", "USER"]).optional(),
  department: z.string().min(1).max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const ResetPasswordDto = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;
