import { useEffect, useMemo, useState } from 'react';
import {
  TIMELINE_DATA,
  resolveTimelineStatuses,
  type TimelineStage,
  type TimelineStageWithStatus,
} from '../data/competitions';
import { PublicApi, type TimelineStageRecord } from '../services/apiService';

interface CachedTimeline {
  stages: TimelineStage[];
  serverTimeMs: number;
  extendedActive: boolean;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60_000;
let memoryCache: CachedTimeline | null = null;
let inflightPromise: Promise<CachedTimeline> | null = null;

function mapApiStage(row: TimelineStageRecord): TimelineStage {
  return {
    id: row.id || row.stage_key,
    stageKey: row.stage_key,
    date: row.date_label,
    shortDate: row.short_date || row.date_label,
    title: row.title,
    desc: row.description || '',
    startAt: row.start_at,
    endAt: row.end_at,
    visibleFrom: row.visible_from || null,
    isExtended: Boolean(row.is_extended),
  };
}

export function invalidateTimelineCache() {
  memoryCache = null;
}

async function fetchTimelineOnce(): Promise<CachedTimeline> {
  if (memoryCache && Date.now() - memoryCache.fetchedAt < CACHE_TTL_MS) {
    return memoryCache;
  }
  if (!inflightPromise) {
    inflightPromise = PublicApi.getTimeline()
      .then((res) => {
        const mapped = Array.isArray(res.stages) && res.stages.length > 0
          ? res.stages.map(mapApiStage)
          : TIMELINE_DATA;
        const parsedServerMs = res.server_time ? new Date(res.server_time).getTime() : Date.now();
        const entry: CachedTimeline = {
          stages: mapped,
          serverTimeMs: Number.isFinite(parsedServerMs) ? parsedServerMs : Date.now(),
          extendedActive: Boolean(res.extended_active),
          fetchedAt: Date.now(),
        };
        memoryCache = entry;
        return entry;
      })
      .finally(() => {
        inflightPromise = null;
      });
  }
  return inflightPromise;
}

export function useTimeline(): {
  stages: TimelineStageWithStatus[];
  extendedActive: boolean;
  effectiveDeadlineLabel: string;
} {
  const [rawStages, setRawStages] = useState<TimelineStage[]>(() => memoryCache?.stages || TIMELINE_DATA);
  const [nowMs, setNowMs] = useState<number>(() => memoryCache?.serverTimeMs || Date.now());
  const [extendedActive, setExtendedActive] = useState<boolean>(() => memoryCache?.extendedActive || false);

  useEffect(() => {
    let active = true;
    fetchTimelineOnce()
      .then((cached) => {
        if (!active) return;
        setRawStages(cached.stages);
        setNowMs(cached.serverTimeMs);
        setExtendedActive(cached.extendedActive);
      })
      .catch(() => {
        // Fallback otomatis ke TIMELINE_DATA lokal jika API belum siap
      });
    return () => {
      active = false;
    };
  }, []);

  const stages = useMemo(() => resolveTimelineStatuses(rawStages, nowMs), [rawStages, nowMs]);

  const effectiveDeadlineLabel = useMemo(() => {
    const extStage = stages.find((s) => s.isExtended);
    if (extendedActive || (extStage && extStage.status === 'current')) {
      return extStage?.shortDate ? `${extStage.shortDate} (Extended)` : '23 Januari 2027 (Extended)';
    }
    return '16 Januari 2027';
  }, [stages, extendedActive]);

  return { stages, extendedActive, effectiveDeadlineLabel };
}
