export interface Belief {
  id: string;
  content: string;
  confidence: number; // 0 to 1
  timestamp: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface BeliefEdge {
  fromId: string;
  toId: string;
  relationship: string; // e.g., "supports", "contradicts", "refines", "derived_from"
  strength: number; // 0 to 1
}

export interface BeliefGraphData {
  beliefs: Belief[];
  edges: BeliefEdge[];
}

export type BeliefUpdateType = "NEW" | "REFINE" | "CONTRADICT" | "STRENGTHEN" | "WEAKEN";
