import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import fs from "node:fs";
import archiver from "archiver";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const dirPath = path.join(process.cwd(), "public", "extension", "ai-consulate");
  if (!fs.existsSync(dirPath)) {
    return res.status(404).json({ error: "extension not found" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=ai-consulate-extension.zip"
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  });
  archive.pipe(res);
  archive.directory(dirPath, false);
  await archive.finalize();
}


