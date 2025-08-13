import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  // Placeholder for extension OAuth start if needed. For now, return a state and PKCE for future use.
  const verifier = crypto.randomBytes(32).toString("base64url");
  const state = crypto.randomUUID();
  return res.status(200).json({ codeVerifier: verifier, state });
}


