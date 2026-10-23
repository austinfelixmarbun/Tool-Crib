import { z } from "zod";

export const CreateWorkCenterDto = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(10),
  orgCode: z.string().min(1).max(10),
});

export const UpdateWorkCenterDto = CreateWorkCenterDto.partial();

export const CreateWorkAreaDto = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
});

export const UpdateWorkAreaDto = CreateWorkAreaDto.partial();

export type CreateWorkCenterDto = z.infer<typeof CreateWorkCenterDto>;
export type UpdateWorkCenterDto = z.infer<typeof UpdateWorkCenterDto>;
export type CreateWorkAreaDto = z.infer<typeof CreateWorkAreaDto>;
export type UpdateWorkAreaDto = z.infer<typeof UpdateWorkAreaDto>;
