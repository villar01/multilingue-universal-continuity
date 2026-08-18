export const AGGREGATE_LEARNING_EVENTS = [
  "open_abc_book",
  "open_pareto",
  "open_immersive_scene",
] as const;

export type AggregateLearningEvent = (typeof AGGREGATE_LEARNING_EVENTS)[number];

type AggregateAnalyticsClient = {
  track?: (event: AggregateLearningEvent) => void;
};

declare global {
  interface Window {
    umami?: AggregateAnalyticsClient;
  }
}

/** Emits only a fixed event name; no identity, URL detail, learning answer or conversation content is sent. */
export function trackAggregateLearningEvent(event: AggregateLearningEvent) {
  if (typeof window === "undefined") return;
  window.umami?.track?.(event);
}
