import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";

const schema = z.object({
  extensionId: z.string().min(1),
  instanceId: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { extensionId, instanceId } = parsed.data;
  const inst = await db.installation.upsert({
    where: { extensionId_instanceId: { extensionId, instanceId } },
    create: { extensionId, instanceId },
    update: { lastSeen: new Date() },
  });
  return res.status(200).json({ ok: true, installationId: inst.id });
}


