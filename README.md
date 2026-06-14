# Agent Belief Graph

A specialized tool for tracking, analyzing, and visualizing the evolving belief state of an AI agent across long-term projects using Directed Acyclic Graphs (DAGs).

## Features

- **Belief Tracking**: Record beliefs with confidence levels, timestamps, and sources.
- **Relationship Mapping**: Link beliefs with relationships like `supports`, `contradicts`, `refines`, and `derived_from`.
- **Inconsistency Detection**: Automatically identify contradictions and calculate an inconsistency score for the entire graph.
- **Traceability**: Track upstream origins and downstream implications of any belief.
- **Visualization**: Export the belief graph to D2 format for visual analysis.
- **Pruning**: Automatically remove low-confidence beliefs to maintain graph integrity.

## Installation

```bash
bun install
```

## Usage

### CLI Interface

1. **Initialize a new graph**:
   ```bash
   bun src/index.ts init
   ```

2. **Add a belief**:
   ```bash
   bun src/index.ts add "The project deadline is Friday" --confidence 0.9 --source "email_from_manager"
   ```

3. **Link beliefs**:
   ```bash
   bun src/index.ts link [ID1] [ID2] supports
   ```

4. **Analyze the graph**:
   ```bash
   bun src/index.ts analyze
   ```

5. **Visualize**:
   ```bash
   bun src/index.ts visualize --format d2 --output graph.d2
   ```

### Library Usage

```typescript
import { BeliefGraph } from "./graph";
import { BeliefVisualizer } from "./visualization";

const graph = new BeliefGraph();
const b1 = graph.addBelief("Initial assumption", 0.8);
const b2 = graph.addBelief("Derived conclusion", 0.7);

graph.linkBeliefs(b1.id, b2.id, "derived_from");

const visualizer = new BeliefVisualizer(graph);
console.log(visualizer.toD2());
```

## Architecture

The system is built as a Directed Acyclic Graph where:
- **Nodes** represent individual beliefs at a specific point in time.
- **Edges** represent semantic relationships between those beliefs.

This structure allows agents to "reason out loud" and maintain a persistent, auditable record of their internal logic state, which is critical for long-running autonomous tasks where context drift is a major risk.

## License

MIT
