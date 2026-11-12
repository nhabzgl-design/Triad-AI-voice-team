# TRIAD AI — Three Minds. One Mission.

An independent multi-model AI team with a voice-first interface. TRIAD sends a task to separate model providers, collects independent drafts, runs a cross-review round, and produces a clearly labeled synthesis.

## Important truth about independence
Each seat is a real provider/model endpoint, not a role-played persona. The app only claims a provider participated when its API call succeeds. Missing keys, rate limits, and provider errors are shown as unavailable; they are never silently represented as a real vote.

## Current MVP
- Three configurable seats: OpenAI, Anthropic Claude, and Meta Llama through a compatible hosted inference provider.
- Independent first-pass responses, followed by peer critique and final synthesis.
- Browser voice input/output where supported by the device/browser.
- API keys remain on the server in environment variables; never put secrets in browser code or commit them.
- Health endpoint and automated tests.

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and add keys for the providers you choose.
3. Run `npm install`, then `npm start`.
4. Open http://localhost:3000.

The server can start without keys so the interface and health check remain usable. AI deliberation requires at least one configured provider; three independent seats require three successful provider calls.

## Provider setup
- OpenAI: `OPENAI_API_KEY`, optional `OPENAI_MODEL` (default `gpt-4o-mini`).
- Anthropic: `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`).
- Llama: `LLAMA_API_KEY`, `LLAMA_BASE_URL`, `LLAMA_MODEL`. This is a hosted Llama endpoint using an OpenAI-compatible API. It is not Meta's own API unless the configured endpoint is operated by Meta.

Free-tier availability, quotas, and model names change. No provider is represented as unlimited or guaranteed free. Do not enable billing unless you explicitly choose to.

## Safety and privacy
- Never commit `.env`, API keys, or personal credentials.
- Treat model output as untrusted text. TRIAD does not execute model-generated code or actions.
- Do not use the app as the sole authority for medical, legal, financial, or safety-critical decisions.
- This MVP does not store conversations in a database.

## Deployment
Deploy the Node service to a Node-compatible host and configure environment variables in that host's secret settings. A free host may sleep, impose limits, or change its free plan. HTTPS is required for browser microphone access on deployed sites.

## Project status
Initial scaffold. Provider calls and automated checks are implemented; production hardening, persistent history, streaming, and native Android packaging remain future work.
