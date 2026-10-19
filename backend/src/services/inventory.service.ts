// src/services/inventory.service.ts
import type {
  CreateToolTypeDto,
  CreateToolUnitDto,
  UpdateToolTypeDto,
  UpdateToolUnitDto,
} from "../dtos/tool.dto.ts";
import * as toolTypeRepo from "../repositories/tool-type.repository.ts";
import * as toolUnitRepo from "../repositories/tool-unit.repository.ts";
import { notFound } from "../utils/app-error.ts";

export async function listToolTypes(programId?: number) {
  return await toolTypeRepo.listToolTypes(programId);
}

export async function getToolTypeById(id: number) {
  const toolType = await toolTypeRepo.getToolTypeWithUnits(id);
  if (!toolType) throw notFound("Tool type not found");
  return toolType;
}

export async function createToolType(dto: CreateToolTypeDto) {
  return await toolTypeRepo.createToolType(dto);
}

export async function updateToolType(id: number, dto: UpdateToolTypeDto) {
  return await toolTypeRepo.updateToolType(id, dto);
}

export async function deleteToolType(id: number) {
  return await toolTypeRepo.deleteToolType(id);
}

// Tool Units
export async function listUnitsByToolType(toolTypeId: number) {
  return await toolUnitRepo.listUnitsByToolType(toolTypeId);
}

export async function createToolUnit(dto: CreateToolUnitDto) {
  return await toolUnitRepo.createUnit(dto);
}

export async function updateToolUnitStatus(id: number, dto: UpdateToolUnitDto) {
  return await toolUnitRepo.updateUnitStatus(id, dto);
}

export async function deleteToolUnit(id: number) {
  return await toolUnitRepo.deleteUnit(id);
}

// Calibration status helper (qcPeriode in months, no automated lockout, informational warnings)
export async function getCalibrationOverview() {
  const toolTypes = await toolTypeRepo.listToolTypes();
  return toolTypes.map((t) => ({
    id: t.id,
    toolNumber: t.toolNumber,
    name: t.name,
    qcPeriodeMonths: t.qcPeriode,
    location: t.location,
    requiresQcCheck: (t.qcPeriode ?? 0) > 0,
  }));
}
