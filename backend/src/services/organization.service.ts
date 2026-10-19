// src/services/organization.service.ts
import type {
  CreateWorkAreaDto,
  CreateWorkCenterDto,
  UpdateWorkAreaDto,
  UpdateWorkCenterDto,
} from "../dtos/organization.dto.ts";
import * as workAreaRepo from "../repositories/work-area.repository.ts";
import * as workCenterRepo from "../repositories/work-center.repository.ts";
import { notFound } from "../utils/app-error.ts";

// Work Centers
export async function listWorkCenters() {
  return await workCenterRepo.listWorkCenters();
}

export async function getWorkCenterById(id: number) {
  const wc = await workCenterRepo.findWorkCenterById(id);
  if (!wc) throw notFound("Work center not found");
  return wc;
}

export async function createWorkCenter(dto: CreateWorkCenterDto) {
  return await workCenterRepo.createWorkCenter(dto);
}

export async function updateWorkCenter(id: number, dto: UpdateWorkCenterDto) {
  return await workCenterRepo.updateWorkCenter(id, dto);
}

export async function deleteWorkCenter(id: number) {
  return await workCenterRepo.deleteWorkCenter(id);
}

// Work Areas
export async function listWorkAreas() {
  return await workAreaRepo.listWorkAreas();
}

export async function getWorkAreaById(id: number) {
  const wa = await workAreaRepo.findWorkAreaById(id);
  if (!wa) throw notFound("Work area not found");
  return wa;
}

export async function createWorkArea(dto: CreateWorkAreaDto) {
  return await workAreaRepo.createWorkArea(dto);
}

export async function updateWorkArea(id: number, dto: UpdateWorkAreaDto) {
  return await workAreaRepo.updateWorkArea(id, dto);
}

export async function deleteWorkArea(id: number) {
  return await workAreaRepo.deleteWorkArea(id);
}
