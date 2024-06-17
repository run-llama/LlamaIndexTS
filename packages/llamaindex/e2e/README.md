# LlamaIndexTS Core E2E Tests

## Overview

We are using Node.js Test Runner to run E2E tests for LlamaIndexTS Core.

It supports the following features:

- Run tests in parallel
- Pure Node.js Environment
- Switch between mock and real LLM API
- Customizable logics

## Usage

- Run with mock register:

```shell
node --import tsx --import ./mock-register.js --test ./node/basic.e2e.ts
```

- Run without mock register:

```shell
node --import tsx --test ./node/basic.e2e.ts
```

- Run with specific test:

```shell
node --import tsx --import ./mock-register.js --test-name-pattern=agent --test ./node/basic.e2e.ts
```

- Run with debug logs:

```shell
CONSOLA_LEVEL=5 node --import tsx --import ./mock-register.js --test-name-pattern=agent --test ./node/basic.e2e.ts
```
