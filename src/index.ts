#!/usr/bin/env bun
import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import { BeliefGraph } from "./graph";
import { BeliefVisualizer } from "./visualization";

const program = new Command();

program
  .name("agent-belief-graph")
  .description("Track and visualize AI agent belief states")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new belief graph")
  .option("-o, --output <path>", "Output file path", "belief-graph.json")
  .action((options) => {
    const graph = new BeliefGraph();
    writeFileSync(options.output, JSON.stringify(graph.exportData(), null, 2));
    console.log(`Initialized empty graph at ${options.output}`);
  });

program
  .command("add")
  .description("Add a belief to the graph")
  .argument("<content>", "Belief content")
  .option("-g, --graph <path>", "Graph file path", "belief-graph.json")
  .option("-c, --confidence <number>", "Confidence level (0-1)", "0.5")
  .option("-s, --source <string>", "Source of the belief")
  .action((content, options) => {
    const data = JSON.parse(readFileSync(options.graph, "utf-8"));
    const graph = new BeliefGraph(data);
    const belief = graph.addBelief(content, parseFloat(options.confidence), options.source);
    writeFileSync(options.graph, JSON.stringify(graph.exportData(), null, 2));
    console.log(`Added belief: ${belief.id.slice(0, 8)}`);
  });

program
  .command("link")
  .description("Link two beliefs")
  .argument("<fromId>", "Source belief ID (short or long)")
  .argument("<toId>", "Target belief ID (short or long)")
  .argument("<relationship>", "Relationship type (supports, contradicts, etc.)")
  .option("-g, --graph <path>", "Graph file path", "belief-graph.json")
  .option("-s, --strength <number>", "Relationship strength", "1.0")
  .action((fromId, toId, relationship, options) => {
    const data = JSON.parse(readFileSync(options.graph, "utf-8"));
    const graph = new BeliefGraph(data);
    
    // Resolve short IDs if needed
    const beliefs = graph.getAllBeliefs();
    const findFullId = (id: string) => {
      if (id.length === 36) return id;
      const match = beliefs.find(b => b.id.startsWith(id));
      return match ? match.id : id;
    };

    graph.linkBeliefs(findFullId(fromId), findFullId(toId), relationship, parseFloat(options.strength));
    writeFileSync(options.graph, JSON.stringify(graph.exportData(), null, 2));
    console.log(`Linked ${fromId} ${relationship} ${toId}`);
  });

program
  .command("visualize")
  .description("Export graph to D2 or Markdown")
  .option("-g, --graph <path>", "Graph file path", "belief-graph.json")
  .option("-f, --format <format>", "Output format (d2, md)", "d2")
  .option("-o, --output <path>", "Output file path")
  .action((options) => {
    const data = JSON.parse(readFileSync(options.graph, "utf-8"));
    const graph = new BeliefGraph(data);
    const visualizer = new BeliefVisualizer(graph);
    
    let output = "";
    if (options.format === "md") {
      output = visualizer.toMarkdown();
    } else {
      output = visualizer.toD2();
    }

    if (options.output) {
      writeFileSync(options.output, output);
      console.log(`Exported to ${options.output}`);
    } else {
      console.log(output);
    }
  });

program
  .command("analyze")
  .description("Analyze the graph for contradictions and inconsistency")
  .option("-g, --graph <path>", "Graph file path", "belief-graph.json")
  .action((options) => {
    const data = JSON.parse(readFileSync(options.graph, "utf-8"));
    const graph = new BeliefGraph(data);
    
    console.log("--- Belief Graph Analysis ---");
    console.log(`Total Beliefs: ${graph.getAllBeliefs().length}`);
    console.log(`Total Relationships: ${graph.getEdges().length}`);
    console.log(`Inconsistency Score: ${graph.calculateInconsistencyScore().toFixed(4)}`);
    
    const contradictions = graph.findContradictions();
    if (contradictions.length > 0) {
      console.log("\nDetected Contradictions:");
      contradictions.forEach(c => {
        console.log(`[${c.b1.id.slice(0,8)}] <-> [${c.b2.id.slice(0,8)}]: ${c.b1.content.slice(0, 30)}... vs ${c.b2.content.slice(0, 30)}...`);
      });
    }
  });

program.parse(process.argv);
