import { BeliefGraph } from "./graph";
import { Belief, BeliefEdge } from "./types";

export class BeliefVisualizer {
  constructor(private graph: BeliefGraph) {}

  public toD2(): string {
    const beliefs = this.graph.getAllBeliefs();
    const edges = this.graph.getEdges();

    let d2 = "";

    // Define nodes
    for (const belief of beliefs) {
      const label = this.sanitize(belief.content);
      const shortId = belief.id.slice(0, 8);
      d2 += `${shortId}: ${label} {\n`;
      d2 += `  shape: rectangle\n`;
      d2 += `  tooltip: "Confidence: ${belief.confidence.toFixed(2)}"\n`;
      
      // Color by confidence
      if (belief.confidence > 0.8) {
        d2 += `  style.fill: "#d1fae5"\n`; // Green
      } else if (belief.confidence < 0.4) {
        d2 += `  style.fill: "#fee2e2"\n`; // Red
      } else {
        d2 += `  style.fill: "#fef3c7"\n`; // Yellow
      }
      
      d2 += `}\n`;
    }

    // Define edges
    for (const edge of edges) {
      const from = edge.fromId.slice(0, 8);
      const to = edge.toId.slice(0, 8);
      
      let arrow = "->";
      let style = "";
      
      if (edge.relationship === "contradicts") {
        arrow = "<->";
        style = ` { style.stroke: "#ef4444"; stroke-width: 2 }`;
      } else if (edge.relationship === "supports") {
        style = ` { style.stroke: "#10b981" }`;
      } else if (edge.relationship === "derived_from") {
        style = ` { style.stroke-dash: 5 }`;
      }

      d2 += `${from} ${arrow} ${to}: ${edge.relationship}${style}\n`;
    }

    return d2;
  }

  public toMarkdown(): string {
    const beliefs = this.graph.getAllBeliefs();
    let md = "# Agent Belief Graph\n\n";
    
    md += "## Beliefs\n\n";
    md += "| ID | Content | Confidence | Timestamp |\n";
    md += "| --- | --- | --- | --- |\n";
    
    for (const b of beliefs) {
      md += `| ${b.id.slice(0, 8)} | ${b.content} | ${(b.confidence * 100).toFixed(0)}% | ${new Date(b.timestamp).toLocaleString()} |\n`;
    }

    const contradictions = this.graph.findContradictions();
    if (contradictions.length > 0) {
      md += "\n## Identified Contradictions\n\n";
      for (const c of contradictions) {
        md += `- **${c.b1.content.slice(0, 50)}...** CONTRADICTS **${c.b2.content.slice(0, 50)}...**\n`;
      }
    }

    return md;
  }

  private sanitize(text: string): string {
    const truncated = text.length > 50 ? text.slice(0, 47) + "..." : text;
    return `"${truncated.replace(/"/g, "'")}"`;
  }
}
