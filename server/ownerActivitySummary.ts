export type DatedAggregateRecord = { createdAt: Date | null | undefined };

export type OwnerActivityDay = {
  day: string;
  assistedRequests: number;
  securityIncidents: number;
  customerReturns: number;
};

/** Forma séries curtas exclusivamente a partir de contagens, sem transportar qualquer dado pessoal. */
export function buildOwnerActivitySeries(
  input: {
    usageRecords: readonly DatedAggregateRecord[];
    incidentRecords: readonly DatedAggregateRecord[];
    feedbackRecords: readonly DatedAggregateRecord[];
  },
  now = new Date(),
): OwnerActivityDay[] {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() - (6 - offset));
    return { day: date.toISOString().slice(0, 10), assistedRequests: 0, securityIncidents: 0, customerReturns: 0 };
  });
  const byDay = new Map(days.map((day) => [day.day, day]));
  const increment = (records: readonly DatedAggregateRecord[], key: "assistedRequests" | "securityIncidents" | "customerReturns") => {
    records.forEach((record) => {
      if (!record.createdAt) return;
      const day = byDay.get(record.createdAt.toISOString().slice(0, 10));
      if (day) day[key] += 1;
    });
  };

  increment(input.usageRecords, "assistedRequests");
  increment(input.incidentRecords, "securityIncidents");
  increment(input.feedbackRecords, "customerReturns");
  return days;
}
