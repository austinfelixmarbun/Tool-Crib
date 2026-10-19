// src/services/auth.service.ts
import argon2 from "argon2";
import { createSessionCookie } from "../middlewares/auth.middleware.ts";
import {
  findUserByEmail,
  findUserByEmployeeId,
  findUserById,
} from "../repositories/user.repository.ts";
import type { UserRole, UserSession } from "../types/express.d.ts";
import { unauthorized } from "../utils/app-error.ts";

export async function loginService(dto: {
  email?: string;
  employeeId?: number;
  password: string;
}) {
  const user = dto.email
    ? await findUserByEmail(dto.email)
    : dto.employeeId
    ? await findUserByEmployeeId(dto.employeeId)
    : null;

  if (!user) {
    throw unauthorized("Invalid credentials");
  }

  if (user.status !== "ACTIVE") {
    throw unauthorized("Account is inactive");
  }

  if (!user.passwordHash) {
    throw unauthorized("Password not set for account");
  }

  const isValid = await argon2.verify(user.passwordHash, dto.password);
  if (!isValid) {
    throw unauthorized("Invalid credentials");
  }

  const sessionPayload: UserSession = {
    id: user.id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    workCenterId: user.workCenterId,
    workAreaId: user.workAreaId,
  };

  const sessionCookie = createSessionCookie(sessionPayload);

  return {
    user: sessionPayload,
    sessionCookie,
  };
}

export async function getMeService(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw unauthorized("User not found");
  }

  return {
    id: user.id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    role: user.role,
    workCenterId: user.workCenterId,
    workAreaId: user.workAreaId,
    department: user.department,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
