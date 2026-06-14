import { Belief, BeliefEdge, BeliefGraphData, BeliefUpdateType } from "./types";
import { v4 as uuidv4 } from "uuid";

export class BeliefGraph {
  private beliefs: Map<string, Belief> = new Map();
  private edges: BeliefEdge[] = [];

  constructor(data?: BeliefGraphData) {
    if (data) {
      data.beliefs.forEach((b) => this.beliefs.set(b.id, b));
      this.edges = [...data.edges];
    }
  }

  public addBelief(content: string, confidence: number, source?: string, metadata?: Record<string, any>): Belief {
    const belief: Belief = {
      id: uuidv4(),
      content,
      confidence,
      timestamp: new Date().toISOString(),
      source,
      metadata,
    };
    this.beliefs.set(belief.id, belief);
    return belief;
  }

  public linkBeliefs(fromId: string, toId: string, relationship: string, strength: number = 1.0): void {
    if (!this.beliefs.has(fromId) || !this.beliefs.has(toId)) {
      throw new Error(`Belief not found: ${!this.beliefs.has(fromId) ? fromId : toId}`);
    }
    this.edges.push({ fromId, toId, relationship, strength });
  }

  public getBelief(id: string): Belief | undefined {
    return this.beliefs.get(id);
  }

  public getAllBeliefs(): Belief[] {
    return Array.from(this.beliefs.values());
  }

  public getEdges(): BeliefEdge[] {
    return [...this.edges];
  }

  public findContradictions(): { b1: Belief; b2: Belief; edge: BeliefEdge }[] {
    return this.edges
      .filter((e) => e.relationship === "contradicts")
      .map((e) => ({
        b1: this.beliefs.get(e.fromId)!,
        b2: this.beliefs.get(e.toId)!,
        edge: e,
      }));
  }

  public getDownstream(beliefId: string): Belief[] {
    const visited = new Set<string>();
    const queue = [beliefId];
    const result: Belief[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (currentId !== beliefId) {
        result.push(this.beliefs.get(currentId)!);
      }

      const downstreamEdges = this.edges.filter((e) => e.fromId === currentId);
      downstreamEdges.forEach((e) => queue.push(e.toId));
    }

    return result;
  }

  public getUpstream(beliefId: string): Belief[] {
    const visited = new Set<string>();
    const queue = [beliefId];
    const result: Belief[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (currentId !== beliefId) {
        result.push(this.beliefs.get(currentId)!);
      }

      const upstreamEdges = this.edges.filter((e) => e.toId === currentId);
      upstreamEdges.forEach((e) => queue.push(e.fromId));
    }

    return result;
  }

  public exportData(): BeliefGraphData {
    return {
      beliefs: this.getAllBeliefs(),
      edges: this.getEdges(),
    };
  }

  public findPaths(startId: string, endId: string): Belief[][] {
    const paths: Belief[][] = [];
    const dfs = (currentId: string, currentPath: Belief[]) => {
      const currentBelief = this.beliefs.get(currentId)!;
      const nextPath = [...currentPath, currentBelief];

      if (currentId === endId) {
        paths.push(nextPath);
        return;
      }

      const neighbors = this.edges.filter((e) => e.fromId === currentId).map((e) => e.toId);
      for (const neighborId of neighbors) {
        if (!currentPath.some((b) => b.id === neighborId)) {
          dfs(neighborId, nextPath);
        }
      }
    };

    dfs(startId, []);
    return paths;
  }

  public calculateInconsistencyScore(): number {
    const contradictions = this.findContradictions();
    if (this.beliefs.size === 0) return 0;
    
    let score = 0;
    for (const contradiction of contradictions) {
      // Contradictions between high confidence beliefs carry more weight
      score += (contradiction.b1.confidence + contradiction.b2.confidence) / 2;
    }
    
    return score / this.beliefs.size;
  }

  public pruneWeakBeliefs(threshold: number): number {
    const beforeCount = this.beliefs.size;
    const weakBeliefIds = Array.from(this.beliefs.values())
      .filter((b) => b.confidence < threshold)
      .map((b) => b.id);

    for (const id of weakBeliefIds) {
      this.beliefs.delete(id);
      this.edges = this.edges.filter((e) => e.fromId !== id && e.toId !== id);
    }

    return beforeCount - this.beliefs.size;
  }

  public getRootBeliefs(): Belief[] {
    const targetIds = new Set(this.edges.map((e) => e.toId));
    return Array.from(this.beliefs.values()).filter((b) => !targetIds.has(b.id));
  }
}
