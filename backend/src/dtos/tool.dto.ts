import { z } from "zod";

export const CreateToolTypeDto = z.object({
  toolNumber: z.string().min(1).max(30),
  name: z.string().min(1).max(100),
  programId: z.number().int().positive(),
  description: z.string().max(255).optional(),
  qcPeriode: z.number().int().positive().optional(),
  location: z.string().min(1).max(100),
});

export const UpdateToolTypeDto = CreateToolTypeDto.partial();

export const CreateToolUnitDto = z.object({
  toolId: z.number().int().positive(),
  seqNo: z.string().max(5),
  status: z.enum(["READY", "BORROWED", "INSPECTION", "MAINTANANCE", "SCRAPPED"]).optional(),
});

export const UpdateToolUnitDto = z.object({
  status: z.enum(["READY", "BORROWED", "INSPECTION", "MAINTANANCE", "SCRAPPED"]),
});

export type CreateToolTypeDto = z.infer<typeof CreateToolTypeDto>;
export type UpdateToolTypeDto = z.infer<typeof UpdateToolTypeDto>;
export type CreateToolUnitDto = z.infer<typeof CreateToolUnitDto>;
export type UpdateToolUnitDto = z.infer<typeof UpdateToolUnitDto>;
