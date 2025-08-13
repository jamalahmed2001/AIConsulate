import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { mintAccessToken } from "@/server/auth/tokens";

function setCors(res: NextApiResponse, origin?: string | null) {
  res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(res, req.headers.origin ?? "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_body" });
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  if (!user?.passwordHash) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const { token, expiresAt } = await mintAccessToken({ userId: user.id, scope: "extension" });
  return res.status(200).json({ accessToken: token, expiresAt });
}


