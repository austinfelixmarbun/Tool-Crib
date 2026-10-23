import { and, eq } from "drizzle-orm";
import { db } from "../config/database.ts";
import { toolUnit } from "../db/schema/index.ts";
import type { CreateToolUnitDto, UpdateToolUnitDto } from "../dtos/tool.dto.ts";
import { conflict, notFound } from "../utils/app-error.ts";

export async function listUnitsByToolType(toolTypeId: number) {
  return db
    .select()
    .from(toolUnit)
    .where(eq(toolUnit.toolId, toolTypeId));
}

export async function findUnitById(id: number) {
  const [row] = await db
    .select()
    .from(toolUnit)
    .where(eq(toolUnit.id, id))
    .limit(1);
  return row ?? null;
}

export async function findAvailableUnits(toolTypeId: number, qty: number) {
  return db
    .select()
    .from(toolUnit)
    .where(and(eq(toolUnit.toolId, toolTypeId), eq(toolUnit.status, "READY")))
    .limit(qty);
}

export async function createUnit(dto: CreateToolUnitDto) {
  const [dup] = await db
    .select({ id: toolUnit.id })
    .from(toolUnit)
    .where(and(eq(toolUnit.toolId, dto.toolId), eq(toolUnit.seqNo, dto.seqNo)))
    .limit(1);
  if (dup) throw conflict(`Seq no "${dto.seqNo}" already exists for this tool type`);

  const [created] = await db
    .insert(toolUnit)
    .values({ toolId: dto.toolId, seqNo: dto.seqNo, status: dto.status ?? "READY" })
    .returning();
  return created;
}

export async function updateUnitStatus(id: number, dto: UpdateToolUnitDto) {
  const [updated] = await db
    .update(toolUnit)
    .set({ status: dto.status })
    .where(eq(toolUnit.id, id))
    .returning();
  if (!updated) throw notFound("Tool unit not found");
  return updated;
}

export async function deleteUnit(id: number) {
  const [unit] = await db
    .select()
    .from(toolUnit)
    .where(eq(toolUnit.id, id))
    .limit(1);
  if (!unit) throw notFound("Tool unit not found");
  if (unit.status === "BORROWED")
    throw conflict("Cannot delete a unit that is currently borrowed");

  await db.delete(toolUnit).where(eq(toolUnit.id, id));
}
