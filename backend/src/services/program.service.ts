import type { CreateProgramDto, UpdateProgramDto } from "../dtos/program.dto.ts";
import * as programRepo from "../repositories/program.repository.ts";
import { notFound } from "../utils/app-error.ts";

export async function listPrograms() {
  return await programRepo.listPrograms();
}

export async function getProgramById(id: number) {
  const prog = await programRepo.findProgramById(id);
  if (!prog) throw notFound("Program not found");
  return prog;
}

export async function createProgram(dto: CreateProgramDto) {
  return await programRepo.createProgram(dto);
}

export async function updateProgram(id: number, dto: UpdateProgramDto) {
  return await programRepo.updateProgram(id, dto);
}

export async function deleteProgram(id: number) {
  return await programRepo.deleteProgram(id);
}
