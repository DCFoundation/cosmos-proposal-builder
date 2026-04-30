export type EnableChunkingState =
  | { kind: "disabled" }
  | { kind: "enabled" }
  | { kind: "override"; bytes: number }
  | { kind: "invalid"; raw: string };

export const parseEnableChunking = (search: string): EnableChunkingState => {
  const params = new URLSearchParams(search);
  if (!params.has("enable-chunking")) return { kind: "disabled" };
  const raw = params.get("enable-chunking");
  if (raw === null || raw === "") return { kind: "enabled" };
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return { kind: "invalid", raw };
  return { kind: "override", bytes: parsed };
};
