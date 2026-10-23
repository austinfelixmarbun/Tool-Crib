import { z } from "zod";

export const LoginDto = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    employeeId: z.coerce.number().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email !== undefined || data.employeeId !== undefined, {
    message: "Either email or employeeId must be provided",
  });

export type LoginDto = z.infer<typeof LoginDto>;
