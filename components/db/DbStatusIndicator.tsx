"use client";

import { useEffect, useRef, useState } from "react";
import {
  recordWarmTimestamp,
  shouldWarmDatabase,
} from "@/lib/db/warm-cache";

type Status = "unknown" | "online" | "offline";

const POLL_MS = 45_000;

async function fetchHealth(): Promise<{
  ok: boolean;
  latencyMs?: number;
}> {
  try {
    const res = await fetch("/api/db/health", { cache: "no-store" });
    const data = (await res.json()) as {
      ok?: boolean;
      latencyMs?: number;
    };
    return { ok: Boolean(data.ok), latencyMs: data.latencyMs };
  } catch {
    return { ok: false };
  }
}

export function DbStatusIndicator() {
  const [status, setStatus] = useState<Status>("unknown");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function tick(isInitial: boolean) {
      const wantWarm = isInitial && shouldWarmDatabase();
      const { ok, latencyMs: ms } = await fetchHealth();
      if (cancelled || !mounted.current) return;
      setStatus(ok ? "online" : "offline");
      setLatencyMs(typeof ms === "number" ? ms : null);
      if (wantWarm && ok) {
        recordWarmTimestamp();
      }
    }

    void tick(true);
    const id = setInterval(() => {
      void tick(false);
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const title =
    status === "unknown"
      ? "Database status"
      : status === "online"
        ? latencyMs != null
          ? `Database online (${latencyMs} ms)`
          : "Database online"
        : "Database unreachable";

  return (
    <div
      className="flex items-center gap-1.5 text-xs text-muted-foreground"
      title={title}
    >
      <span className="sr-only">{title}</span>
      <span
        className={
          status === "unknown"
            ? "size-2 rounded-full bg-muted-foreground/50"
            : status === "online"
              ? "size-2 rounded-full bg-emerald-500"
              : "size-2 rounded-full bg-destructive"
        }
        aria-hidden
      />
      <span className="hidden sm:inline">DB</span>
    </div>
  );
}
