import { expect, test, describe, beforeEach } from "bun:test";
import { BeliefGraph } from "../src/graph";

describe("BeliefGraph", () => {
  let graph: BeliefGraph;

  beforeEach(() => {
    graph = new BeliefGraph();
  });

  test("should add a belief", () => {
    const b = graph.addBelief("The earth is round", 0.99);
    expect(b.content).toBe("The earth is round");
    expect(b.confidence).toBe(0.99);
    expect(graph.getAllBeliefs().length).toBe(1);
  });

  test("should link beliefs", () => {
    const b1 = graph.addBelief("Sky is blue", 1.0);
    const b2 = graph.addBelief("It is daytime", 0.8);
    graph.linkBeliefs(b1.id, b2.id, "supports");
    
    expect(graph.getEdges().length).toBe(1);
    expect(graph.getEdges()[0].relationship).toBe("supports");
  });

  test("should find contradictions", () => {
    const b1 = graph.addBelief("User is logged in", 0.9);
    const b2 = graph.addBelief("User is a guest", 0.8);
    graph.linkBeliefs(b1.id, b2.id, "contradicts");
    
    const contradictions = graph.findContradictions();
    expect(contradictions.length).toBe(1);
    expect(contradictions[0].b1.id).toBe(b1.id);
    expect(contradictions[0].b2.id).toBe(b2.id);
  });

  test("should calculate inconsistency score", () => {
    graph.addBelief("A", 0.9);
    graph.addBelief("B", 0.9);
    // No contradictions yet
    expect(graph.calculateInconsistencyScore()).toBe(0);

    const b1 = graph.addBelief("C", 1.0);
    const b2 = graph.addBelief("D", 1.0);
    graph.linkBeliefs(b1.id, b2.id, "contradicts");
    
    // 1 contradiction of weight 1.0 / 4 beliefs = 0.25
    expect(graph.calculateInconsistencyScore()).toBe(0.25);
  });

  test("should find paths between beliefs", () => {
    const b1 = graph.addBelief("Rain is falling", 1.0);
    const b2 = graph.addBelief("Ground is wet", 0.9);
    const b3 = graph.addBelief("Plants are happy", 0.8);
    
    graph.linkBeliefs(b1.id, b2.id, "derived_from");
    graph.linkBeliefs(b2.id, b3.id, "derived_from");
    
    const paths = graph.findPaths(b1.id, b3.id);
    expect(paths.length).toBe(1);
    expect(paths[0].length).toBe(3);
    expect(paths[0][0].id).toBe(b1.id);
    expect(paths[0][2].id).toBe(b3.id);
  });

  test("should get upstream and downstream beliefs", () => {
    const b1 = graph.addBelief("Root", 1.0);
    const b2 = graph.addBelief("Child", 0.9);
    const b3 = graph.addBelief("Grandchild", 0.8);
    
    graph.linkBeliefs(b1.id, b2.id, "supports");
    graph.linkBeliefs(b2.id, b3.id, "supports");
    
    const downstream = graph.getDownstream(b1.id);
    expect(downstream.length).toBe(2);
    expect(downstream.map(b => b.id)).toContain(b2.id);
    expect(downstream.map(b => b.id)).toContain(b3.id);
    
    const upstream = graph.getUpstream(b3.id);
    expect(upstream.length).toBe(2);
    expect(upstream.map(b => b.id)).toContain(b1.id);
    expect(upstream.map(b => b.id)).toContain(b2.id);
  });

  test("should prune weak beliefs", () => {
    graph.addBelief("Strong", 0.9);
    graph.addBelief("Weak", 0.1);
    graph.addBelief("Medium", 0.5);
    
    const pruned = graph.pruneWeakBeliefs(0.3);
    expect(pruned).toBe(1);
    expect(graph.getAllBeliefs().length).toBe(2);
    expect(graph.getAllBeliefs().find(b => b.content === "Weak")).toBeUndefined();
  });
});
