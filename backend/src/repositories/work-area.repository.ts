import { eq } from "drizzle-orm";
import { db } from "../config/database.ts";
import { workArea as workAreaTable } from "../db/schema/index.ts";
import type {
  CreateWorkAreaDto,
  UpdateWorkAreaDto,
} from "../dtos/organization.dto.ts";
import { notFound } from "../utils/app-error.ts";

export async function listWorkAreas() {
  return db.select().from(workAreaTable).orderBy(workAreaTable.name);
}

export async function findWorkAreaById(id: number) {
  const [row] = await db
    .select()
    .from(workAreaTable)
    .where(eq(workAreaTable.id, id))
    .limit(1);
  return row ?? null;
}

export async function createWorkArea(dto: CreateWorkAreaDto) {
  const [created] = await db.insert(workAreaTable).values(dto).returning();
  return created;
}

export async function updateWorkArea(id: number, dto: UpdateWorkAreaDto) {
  const [updated] = await db
    .update(workAreaTable)
    .set(dto)
    .where(eq(workAreaTable.id, id))
    .returning();

  if (!updated) {
    throw notFound("Work area not found");
  }
  return updated;
}

export async function deleteWorkArea(id: number) {
  const [deleted] = await db
    .delete(workAreaTable)
    .where(eq(workAreaTable.id, id))
    .returning({ id: workAreaTable.id });

  if (!deleted) {
    throw notFound("Work area not found");
  }
}
