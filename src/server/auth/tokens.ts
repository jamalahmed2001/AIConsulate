import crypto from "node:crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { db } from "@/server/db";

type TokenPayload = JWTPayload & {
  userId: string;
  installId?: string | null;
  scope: "extension" | "server";
  jti: string;
};

const encoder = new TextEncoder();
const secret = encoder.encode(process.env.AUTH_SECRET ?? "dev-secret");

export async function mintAccessToken(params: {
  userId: string;
  installId?: string | null;
  scope?: "extension" | "server";
  ttlSeconds?: number;
}): Promise<{ token: string; jti: string; expiresAt: Date }>
{
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (params.ttlSeconds ?? 10 * 60) * 1000);
  await db.apiToken.create({
    data: {
      userId: params.userId,
      installId: params.installId ?? null,
      scope: params.scope ?? "extension",
      jti,
      expiresAt,
    },
  });
  const token = await new SignJWT({
    userId: params.userId,
    installId: params.installId ?? null,
    scope: params.scope ?? "extension",
    jti,
  } satisfies TokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setIssuedAt()
    .sign(secret);
  return { token, jti, expiresAt };
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.jti !== "string") return null;
  const record = await db.apiToken.findUnique({ where: { jti: payload.jti } });
    if (!record || record.revokedAt) return null;
    if (record.expiresAt.getTime() < Date.now()) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function revokeTokenByJti(jti: string): Promise<void> {
  await db.apiToken.update({ where: { jti }, data: { revokedAt: new Date() } });
}

// Helper function to quickly generate a server-side access token
export async function generateAccessToken(userId: string, _scope = "server"): Promise<string> {
  const { token } = await mintAccessToken({
    userId,
    scope: "server",
    ttlSeconds: 60 // 1 minute for internal API calls
  });
  return token;
}


