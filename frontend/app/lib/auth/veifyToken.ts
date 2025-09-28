// lib/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return { error: "אין הרשאה", status: 401 };

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { decoded };
  } catch {
    return { error: "טוקן לא תקין", status: 401 };
  }
}
