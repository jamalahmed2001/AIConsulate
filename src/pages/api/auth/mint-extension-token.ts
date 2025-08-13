import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/server/auth";
import { mintAccessToken } from "@/server/auth/tokens";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await auth(req, res);
  if (!session?.user?.id) return res.status(401).json({ error: "unauthorized" });

  const { token, expiresAt } = await mintAccessToken({
    userId: session.user.id,
    installId: null,
    scope: "extension",
  });
  return res.status(200).json({ accessToken: token, expiresAt });
}


