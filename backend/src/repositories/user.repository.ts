// src/repositories/user.repository.ts
import argon2 from "argon2";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../config/database.ts";
import { user as userTable } from "../db/schema/index.ts";
import type { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.ts";
import { conflict, notFound } from "../utils/app-error.ts";

export async function findUserById(id: string) {
  const [row] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, id))
    .limit(1);
  return row ?? null;
}

export async function findUserByEmail(email: string) {
  const [row] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);
  return row ?? null;
}

export async function findUserByEmployeeId(employeeId: number) {
  const [row] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.employeeId, employeeId))
    .limit(1);
  return row ?? null;
}

export async function listUsers() {
  return db
    .select({
      id: userTable.id,
      employeeId: userTable.employeeId,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      department: userTable.department,
      workCenterId: userTable.workCenterId,
      workAreaId: userTable.workAreaId,
      status: userTable.status,
      createdAt: userTable.createdAt,
      updatedAt: userTable.updatedAt,
    })
    .from(userTable)
    .orderBy(userTable.name);
}

export async function createUser(dto: CreateUserDto) {
  // Check single Super Admin rule
  if (dto.role === "SUPER ADMIN") {
    const existingSuperAdmin = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.role, "SUPER ADMIN"))
      .limit(1);
    if (existingSuperAdmin.length > 0) {
      throw conflict(
        "A Super Admin account already exists. Only one Super Admin is allowed across the organization."
      );
    }
  }

  // Check email uniqueness
  const existing = await findUserByEmail(dto.email);
  if (existing) throw conflict("Email already registered");

  const existingNik = await findUserByEmployeeId(dto.employeeId);
  if (existingNik) throw conflict("Employee ID (NIK) already registered");

  const passwordHash = await argon2.hash(dto.password);

  const [created] = await db
    .insert(userTable)
    .values({
      workCenterId: dto.workCenterId,
      workAreaId: dto.workAreaId,
      employeeId: dto.employeeId,
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      department: dto.department,
    })
    .returning();
  return created;
}

export async function updateUser(id: string, dto: UpdateUserDto) {
  const current = await findUserById(id);
  if (!current) throw notFound("User not found");

  // Prevent changing Super Admin role or creating a second Super Admin
  if (dto.role) {
    if (current.role === "SUPER ADMIN" && dto.role !== "SUPER ADMIN") {
      throw conflict("Cannot demote or change the role of the Super Admin account.");
    }
    if (dto.role === "SUPER ADMIN" && current.role !== "SUPER ADMIN") {
      const existingSuperAdmin = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.role, "SUPER ADMIN"))
        .limit(1);
      if (existingSuperAdmin.length > 0) {
        throw conflict(
          "A Super Admin account already exists. Only one Super Admin is allowed across the organization."
        );
      }
    }
  }

  // Check email uniqueness if being changed
  if (dto.email) {
    const [dup] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(and(eq(userTable.email, dto.email), ne(userTable.id, id)))
      .limit(1);
    if (dup) throw conflict("Email already in use");
  }

  if (dto.employeeId) {
    const [dupNik] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(and(eq(userTable.employeeId, dto.employeeId), ne(userTable.id, id)))
      .limit(1);
    if (dupNik) throw conflict("Employee ID (NIK) already in use");
  }

  const [updated] = await db
    .update(userTable)
    .set({ ...dto, updatedAt: new Date().toISOString() })
    .where(eq(userTable.id, id))
    .returning();

  if (!updated) throw notFound("User not found");
  return updated;
}

export async function resetPassword(id: string, newPassword: string) {
  const passwordHash = await argon2.hash(newPassword);
  const [updated] = await db
    .update(userTable)
    .set({ passwordHash, updatedAt: new Date().toISOString() })
    .where(eq(userTable.id, id))
    .returning({ id: userTable.id });
  if (!updated) throw notFound("User not found");
  return updated;
}

export async function deleteUser(id: string) {
  const current = await findUserById(id);
  if (!current) throw notFound("User not found");
  if (current.role === "SUPER ADMIN") {
    throw conflict("The Super Admin account cannot be deleted.");
  }

  const [deleted] = await db
    .delete(userTable)
    .where(eq(userTable.id, id))
    .returning({ id: userTable.id });
  if (!deleted) throw notFound("User not found");
}
