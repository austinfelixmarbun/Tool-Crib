import { Response } from "express";

export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200
): Response {
  const body: ApiSuccess<T> = { success: true, message, data };
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = "Created"): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): Response {
  const body: ApiError = { success: false, message, ...(errors ? { errors } : {}) };
  return res.status(statusCode).json(body);
}
