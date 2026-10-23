import type {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from "../dtos/user.dto.ts";
import * as userRepo from "../repositories/user.repository.ts";
import { badRequest, notFound } from "../utils/app-error.ts";

export async function getAllUsers() {
  return await userRepo.listUsers();
}

export async function getUserById(id: string) {
  const user = await userRepo.findUserById(id);
  if (!user) throw notFound("User not found");
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function getUserByNik(nik: number) {
  const user = await userRepo.findUserByEmployeeId(nik);
  if (!user) throw notFound("User with specified NIK not found");
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function createUser(dto: CreateUserDto) {
  const created = await userRepo.createUser(dto);
  const { passwordHash, ...sanitized } = created;
  return sanitized;
}

export async function updateUser(id: string, dto: UpdateUserDto) {
  const updated = await userRepo.updateUser(id, dto);
  const { passwordHash, ...sanitized } = updated;
  return sanitized;
}

export async function resetUserPassword(id: string, dto: ResetPasswordDto) {
  if (!dto.newPassword || dto.newPassword.length < 8) {
    throw badRequest("Password must be at least 8 characters");
  }
  await userRepo.resetPassword(id, dto.newPassword);
  return { message: "Password reset successfully" };
}

export async function deleteUser(id: string) {
  await userRepo.deleteUser(id);
  return { message: "User deleted successfully" };
}
