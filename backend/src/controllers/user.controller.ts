import type { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service.ts";
import { sendCreated, sendSuccess } from "../utils/api-response.ts";

export async function getUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAllUsers();
    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function getUserByNik(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userService.getUserByNik(Number(req.params.nik));
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(req.body);
    return sendCreated(res, user, "User created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, user, "User updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.resetUserPassword(req.params.id, req.body);
    return sendSuccess(res, result, "Password reset successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.deleteUser(req.params.id);
    return sendSuccess(res, result, "User deleted successfully");
  } catch (error) {
    next(error);
  }
}
