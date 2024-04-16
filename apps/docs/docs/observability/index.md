# Observability

LlamaIndex provides **one-click observability** 🔭 to allow you to build principled LLM applications in a production setting.

A key requirement for principled development of LLM applications over your data (RAG systems, agents) is being able to observe, debug, and evaluate
your system - both as a whole and for each component.

This feature allows you to seamlessly integrate the LlamaIndex library with powerful observability/evaluation tools offered by our partners.
Configure a variable once, and you'll be able to do things like the following:

- View LLM/prompt inputs/outputs
- Ensure that the outputs of any component (LLMs, embeddings) are performing as expected
- View call traces for both indexing and querying

Each provider has similarities and differences. Take a look below for the full set of guides for each one!

- [OpenLLMetry](#openllmetry)
- [Langtrace](#langtrace)

## OpenLLMetry

[OpenLLMetry](https://github.com/traceloop/openllmetry-js) is an open-source project based on OpenTelemetry for tracing and monitoring
LLM applications. It connects to [all major observability platforms](https://www.traceloop.com/docs/openllmetry/integrations/introduction) and installs in minutes.

### Usage Pattern

```bash
npm install @traceloop/node-server-sdk
```

```js
import * as traceloop from "@traceloop/node-server-sdk";

traceloop.initialize({
  apiKey: process.env.TRACELOOP_API_KEY,
  disableBatch: true,
});
```

## Langtrace

Enhance your observability with Langtrace, a robust open-source tool supports OpenTelemetry and is designed to trace, evaluate, and manage LLM applications seamlessly. Langtrace integrates directly with LlamaIndex, offering detailed, real-time insights into performance metrics such as accuracy, evaluations, and latency.

#### Install

- Self-host or sign-up and generate an API key using [Langtrace](https://www.langtrace.ai) Cloud

```bash
npm install @langtrase/typescript-sdk
```

#### Initialize

```js
import * as Langtrace from "@langtrase/typescript-sdk";
Langtrace.init({ api_key: "<YOUR_API_KEY>" });
```

Features:

- OpenTelemetry compliant, ensuring broad compatibility with observability platforms.
- Provides comprehensive logs and detailed traces of all components.
- Real-time monitoring of accuracy, evaluations, usage, costs, and latency.
- For more configuration options and details, visit [Langtrace Docs](https://docs.langtrace.ai/introduction).
