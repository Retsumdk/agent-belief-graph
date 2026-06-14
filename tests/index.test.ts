import { describe, test, expect } from "bun:test";
describe("agent-belief-graph", () => {
  test("module loads", async () => { const m = await import("./index"); expect(m).toBeDefined(); });
});
