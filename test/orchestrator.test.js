const test = require("node:test");
const assert = require("node:assert/strict");
const { providerStatus, deliberate } = require("../src/orchestrator");

test("provider status does not claim unconfigured providers are ready", () => {
  for (const key of ["OPENAI_API_KEY","ANTHROPIC_API_KEY","LLAMA_API_KEY","LLAMA_BASE_URL","LLAMA_MODEL"]) delete process.env[key];
  assert.deepEqual(providerStatus().map(x => x.configured), [false, false, false]);
});
test("deliberation safely reports missing provider configuration", async () => {
  for (const key of ["OPENAI_API_KEY","ANTHROPIC_API_KEY","LLAMA_API_KEY","LLAMA_BASE_URL","LLAMA_MODEL"]) delete process.env[key];
  const result = await deliberate("Test task");
  assert.equal(result.status, "needs_setup");
  assert.equal(result.synthesis, null);
});
