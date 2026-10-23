import { eq } from "drizzle-orm";
import { db } from "../config/database.ts";
import { tool as toolTable, toolUnit } from "../db/schema/index.ts";
import type { CreateToolTypeDto, UpdateToolTypeDto } from "../dtos/tool.dto.ts";
import { conflict, notFound } from "../utils/app-error.ts";

export async function listToolTypes(programId?: number) {
  const query = db
    .select({
      id: toolTable.id,
      toolNumber: toolTable.toolNumber,
      name: toolTable.name,
      programId: toolTable.programId,
      description: toolTable.description,
      qcPeriode: toolTable.qcPeriode,
      location: toolTable.location,
    })
    .from(toolTable);

  if (programId) {
    return query.where(eq(toolTable.programId, programId));
  }
  return query;
}

export async function findToolTypeById(id: number) {
  const [row] = await db
    .select()
    .from(toolTable)
    .where(eq(toolTable.id, id))
    .limit(1);
  return row ?? null;
}

export async function getToolTypeWithUnits(id: number) {
  const [toolType] = await db.query.tool.findMany({
    where: eq(toolTable.id, id),
    with: { units: true, program: true },
    limit: 1,
  });
  return toolType ?? null;
}

export async function createToolType(dto: CreateToolTypeDto) {
  const [existing] = await db
    .select({ id: toolTable.id })
    .from(toolTable)
    .where(eq(toolTable.toolNumber, dto.toolNumber))
    .limit(1);
  if (existing) throw conflict(`Tool number "${dto.toolNumber}" already exists`);

  const [created] = await db.insert(toolTable).values(dto).returning();
  return created;
}

export async function updateToolType(id: number, dto: UpdateToolTypeDto) {
  const [updated] = await db
    .update(toolTable)
    .set(dto)
    .where(eq(toolTable.id, id))
    .returning();
  if (!updated) throw notFound("Tool type not found");
  return updated;
}

export async function deleteToolType(id: number) {
  const [unit] = await db
    .select({ id: toolUnit.id })
    .from(toolUnit)
    .where(eq(toolUnit.toolId, id))
    .limit(1);
  if (unit) throw conflict("Cannot delete tool type with existing units");

  const [deleted] = await db
    .delete(toolTable)
    .where(eq(toolTable.id, id))
    .returning({ id: toolTable.id });
  if (!deleted) throw notFound("Tool type not found");
}
