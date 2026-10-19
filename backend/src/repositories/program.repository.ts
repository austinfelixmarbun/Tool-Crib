// src/repositories/program.repository.ts
import { eq } from "drizzle-orm";
import { db } from "../config/database.ts";
import { program as programTable } from "../db/schema/index.ts";
import type { CreateProgramDto, UpdateProgramDto } from "../dtos/program.dto.ts";
import { conflict, notFound } from "../utils/app-error.ts";

export async function listPrograms() {
  return db.select().from(programTable).orderBy(programTable.name);
}

export async function findProgramById(id: number) {
  const [row] = await db
    .select()
    .from(programTable)
    .where(eq(programTable.id, id))
    .limit(1);
  return row ?? null;
}

export async function createProgram(dto: CreateProgramDto) {
  const [existing] = await db
    .select({ id: programTable.id })
    .from(programTable)
    .where(eq(programTable.name, dto.name))
    .limit(1);

  if (existing) {
    throw conflict(`Program with name "${dto.name}" already exists`);
  }

  const [created] = await db.insert(programTable).values(dto).returning();
  return created;
}

export async function updateProgram(id: number, dto: UpdateProgramDto) {
  const [updated] = await db
    .update(programTable)
    .set(dto)
    .where(eq(programTable.id, id))
    .returning();

  if (!updated) {
    throw notFound("Program not found");
  }
  return updated;
}

export async function deleteProgram(id: number) {
  const [deleted] = await db
    .delete(programTable)
    .where(eq(programTable.id, id))
    .returning({ id: programTable.id });

  if (!deleted) {
    throw notFound("Program not found");
  }
}
