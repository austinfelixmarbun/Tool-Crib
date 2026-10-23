import { z } from "zod";

export const CreateProgramDto = z.object({
  name: z.string().min(1).max(50),
  category: z.enum(["FIXED WING", "ROTARY WING"]),
});

export const UpdateProgramDto = CreateProgramDto.partial();

export type CreateProgramDto = z.infer<typeof CreateProgramDto>;
export type UpdateProgramDto = z.infer<typeof UpdateProgramDto>;
