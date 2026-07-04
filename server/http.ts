import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export function getSafeErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV !== "production") {
    return error instanceof Error ? error.message : String(error ?? "Unknown error");
  }
  return "Internal Server Error";
}

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

export function genId(prefix: string = "id"): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").substring(0, 12)}`;
}
