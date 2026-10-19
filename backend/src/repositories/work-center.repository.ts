// src/repositories/work-center.repository.ts
import { eq } from "drizzle-orm";
import { db } from "../config/database.ts";
import { workCenter as workCenterTable } from "../db/schema/index.ts";
import type {
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
} from "../dtos/organization.dto.ts";
import { conflict, notFound } from "../utils/app-error.ts";

export async function listWorkCenters() {
  return db.select().from(workCenterTable).orderBy(workCenterTable.name);
}

export async function findWorkCenterById(id: number) {
  const [row] = await db
    .select()
    .from(workCenterTable)
    .where(eq(workCenterTable.id, id))
    .limit(1);
  return row ?? null;
}

export async function createWorkCenter(dto: CreateWorkCenterDto) {
  const [existing] = await db
    .select({ id: workCenterTable.id })
    .from(workCenterTable)
    .where(eq(workCenterTable.code, dto.code))
    .limit(1);

  if (existing) {
    throw conflict(`Work center code "${dto.code}" already exists`);
  }

  const [created] = await db.insert(workCenterTable).values(dto).returning();
  return created;
}

export async function updateWorkCenter(id: number, dto: UpdateWorkCenterDto) {
  const [updated] = await db
    .update(workCenterTable)
    .set(dto)
    .where(eq(workCenterTable.id, id))
    .returning();

  if (!updated) {
    throw notFound("Work center not found");
  }
  return updated;
}

export async function deleteWorkCenter(id: number) {
  const [deleted] = await db
    .delete(workCenterTable)
    .where(eq(workCenterTable.id, id))
    .returning({ id: workCenterTable.id });

  if (!deleted) {
    throw notFound("Work center not found");
  }
}
