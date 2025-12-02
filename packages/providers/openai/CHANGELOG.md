# @llamaindex/openai

## 0.4.22

### Patch Changes

- 76709c2: fix: first tool call chunk without arguments

## 0.4.21

### Patch Changes

- 1028877: Fix support for reasoning effort, and add support for reasoning summary

## 0.4.20

### Patch Changes

- Updated dependencies [06f884a]
  - @llamaindex/core@0.6.22

## 0.4.19

### Patch Changes

- 5da1cda: feat: support zod v4 & v3
- Updated dependencies [5da1cda]
  - @llamaindex/core@0.6.21

## 0.4.18

### Patch Changes

- 001a515: chore: add minimal reasoning effort for gpt5
- 9d7d205: fix: fix the problem that the usage field in the streaming response was not handled correctly

## 0.4.17

### Patch Changes

- Updated dependencies [0267bb0]
  - @llamaindex/core@0.6.20

## 0.4.16

### Patch Changes

- 4c70376: Add gpt-5 support

## 0.4.15

### Patch Changes

- b6409b6: chore: bump openai version

## 0.4.14

### Patch Changes

- Updated dependencies [f9f1de9]
  - @llamaindex/core@0.6.19

## 0.4.13

### Patch Changes

- Updated dependencies [f29799e]
- Updated dependencies [7224c06]
  - @llamaindex/core@0.6.18

## 0.4.12

### Patch Changes

- Updated dependencies [38da40b]
  - @llamaindex/core@0.6.17

## 0.4.11

### Patch Changes

- Updated dependencies [a8ec08c]
  - @llamaindex/core@0.6.16

## 0.4.10

### Patch Changes

- 856dd8c: fix: assume new models are function call models

## 0.4.9

### Patch Changes

- a1fdb07: feat: multi-turn image generation support
- Updated dependencies [7ad3411]
- Updated dependencies [5da5b3c]
  - @llamaindex/core@0.6.15

## 0.4.8

### Patch Changes

- Updated dependencies [8eeac33]
  - @llamaindex/core@0.6.14

## 0.4.7

### Patch Changes

- Updated dependencies [d578889]
- Updated dependencies [0fcc92f]
- Updated dependencies [515a8b9]
  - @llamaindex/core@0.6.13

## 0.4.6

### Patch Changes

- Updated dependencies [7039e1a]
- Updated dependencies [7039e1a]
  - @llamaindex/core@0.6.12

## 0.4.5

### Patch Changes

- d8ac8d3: Feat: add support for openai realtime API
- Updated dependencies [a89e187]
- Updated dependencies [62699b7]
- Updated dependencies [c5b2691]
- Updated dependencies [d8ac8d3]
  - @llamaindex/core@0.6.11

## 0.4.4

### Patch Changes

- Updated dependencies [1b5af14]
  - @llamaindex/core@0.6.10

## 0.4.3

### Patch Changes

- Updated dependencies [71598f8]
  - @llamaindex/core@0.6.9

## 0.4.2

### Patch Changes

- c927457: Use base64 for encoding files
- Updated dependencies [c927457]
  - @llamaindex/core@0.6.8

## 0.4.1

### Patch Changes

- 59601dd: Add support for builtin image generation tool
- Updated dependencies [59601dd]
  - @llamaindex/core@0.6.7

## 0.4.0

### Minor Changes

- 3e66ddc: Move Azure models to azure package

### Patch Changes

- Updated dependencies [680b529]
- Updated dependencies [361a685]
  - @llamaindex/core@0.6.6

## 0.3.7

### Patch Changes

- 76c9a80: Make core package a peer dependency
- Updated dependencies [d671ed6]
  - @llamaindex/core@0.6.5

## 0.3.6

### Patch Changes

- 9b2e25a: Use Uint8Array instead of Buffer for file type messages (works with non-NodeJS)
- Updated dependencies [9b2e25a]
  - @llamaindex/core@0.6.4
  - @llamaindex/env@0.1.30

## 0.3.5

### Patch Changes

- 3ee8c83: feat: support file content type in message content
- Updated dependencies [3ee8c83]
  - @llamaindex/core@0.6.3

## 0.3.4

### Patch Changes

- e5c3f95: Update o4-mini to accept reasoning parameters and exclude temperature

## 0.3.3

### Patch Changes

- 96dd798: Add o3 and o4-mini models

## 0.3.2

### Patch Changes

- d365eb2: Add GPT-4.1 models to OpenAI

## 0.3.1

### Patch Changes

- 88b7046: Make zod a peer dependency

## 0.3.0

### Minor Changes

- 9c63f3f: Add support for openai responses api

### Patch Changes

- Updated dependencies [9c63f3f]
  - @llamaindex/core@0.6.2

## 0.2.1

### Patch Changes

- Updated dependencies [1b6f368]
- Updated dependencies [eaf326e]
  - @llamaindex/core@0.6.1

## 0.2.0

### Minor Changes

- 91a18e7: Added support for structured output in the chat api of openai and ollama
  Added structured output parameter in the provider

### Patch Changes

- Updated dependencies [21bebfc]
- Updated dependencies [93bc0ff]
- Updated dependencies [91a18e7]
- Updated dependencies [5189b44]
  - @llamaindex/core@0.6.0

## 0.1.61

### Patch Changes

- a8c0637: feat: simplify to provide base URL to OpenAI

## 0.1.60

### Patch Changes

- aea550a: Add factory convenience factory for each LLM provider, e.g. you can use openai instead of 'new OpenAI'
- Updated dependencies [40ee761]
  - @llamaindex/core@0.5.8

## 0.1.59

### Patch Changes

- Updated dependencies [4bac71d]
  - @llamaindex/core@0.5.7

## 0.1.58

### Patch Changes

- Updated dependencies [beb922b]
  - @llamaindex/env@0.1.29
  - @llamaindex/core@0.5.6

## 0.1.57

### Patch Changes

- Updated dependencies [5668970]
  - @llamaindex/core@0.5.5

## 0.1.56

### Patch Changes

- Updated dependencies [ad3c7f1]
  - @llamaindex/core@0.5.4

## 0.1.55

### Patch Changes

- cb256f2: feat: support gpt-4.5
- Updated dependencies [cb021e7]
  - @llamaindex/core@0.5.3

## 0.1.54

### Patch Changes

- Updated dependencies [d952e68]
  - @llamaindex/core@0.5.2

## 0.1.53

### Patch Changes

- Updated dependencies [cc50c9c]
  - @llamaindex/env@0.1.28
  - @llamaindex/core@0.5.1

## 0.1.52

### Patch Changes

- Updated dependencies [6a4a737]
- Updated dependencies [d924c63]
  - @llamaindex/core@0.5.0

## 0.1.51

### Patch Changes

- 1c908fd: Revert previous release (not working with CJS)
- Updated dependencies [1c908fd]
  - @llamaindex/core@0.4.23
  - @llamaindex/env@0.1.27

## 0.1.50

### Patch Changes

- cb608b5: fix: bundle output incorrect
- Updated dependencies [cb608b5]
  - @llamaindex/core@0.4.22
  - @llamaindex/env@0.1.26

## 0.1.49

### Patch Changes

- 15563a0: fix: moved the temp exclusion lower level for o3 mini openai

## 0.1.48

### Patch Changes

- 7265f74: Add reasoning_effort for o1 and o3 models

## 0.1.47

### Patch Changes

- 2019a04: fix: remove temp for o3-mini

## 0.1.46

### Patch Changes

- 1892e1c: Add O3 mini model
- Updated dependencies [9456616]
- Updated dependencies [1931bbc]
  - @llamaindex/core@0.4.21

## 0.1.45

### Patch Changes

- Updated dependencies [d211b7a]
  - @llamaindex/core@0.4.20

## 0.1.44

### Patch Changes

- Updated dependencies [a9b5b99]
  - @llamaindex/core@0.4.19

## 0.1.43

### Patch Changes

- Updated dependencies [b504303]
- Updated dependencies [e0f6cc3]
  - @llamaindex/env@0.1.25
  - @llamaindex/core@0.4.18

## 0.1.42

### Patch Changes

- 3d1808b: chore: bump version
- Updated dependencies [3d1808b]
  - @llamaindex/core@0.4.17

## 0.1.41

### Patch Changes

- 8be4589: chore: bump version
- Updated dependencies [8be4589]
  - @llamaindex/core@0.4.16
  - @llamaindex/env@0.1.24

## 0.1.40

### Patch Changes

- Updated dependencies [d2b2722]
  - @llamaindex/env@0.1.23
  - @llamaindex/core@0.4.15

## 0.1.39

### Patch Changes

- Updated dependencies [969365c]
  - @llamaindex/env@0.1.22
  - @llamaindex/core@0.4.14

## 0.1.38

### Patch Changes

- 90d265c: chore: bump version
- Updated dependencies [90d265c]
  - @llamaindex/core@0.4.13
  - @llamaindex/env@0.1.21

## 0.1.37

### Patch Changes

- Updated dependencies [ef4f63d]
  - @llamaindex/core@0.4.12

## 0.1.36

### Patch Changes

- Updated dependencies [6d22fa2]
  - @llamaindex/core@0.4.11

## 0.1.35

### Patch Changes

- Updated dependencies [a7b0ac3]
- Updated dependencies [c69605f]
  - @llamaindex/core@0.4.10

## 0.1.34

### Patch Changes

- 7ae6eaa: feat: allow pass `additionalChatOptions` to agent
- Updated dependencies [7ae6eaa]
  - @llamaindex/core@0.4.9

## 0.1.33

### Patch Changes

- Updated dependencies [f865c98]
  - @llamaindex/core@0.4.8

## 0.1.32

### Patch Changes

- Updated dependencies [d89ebe0]
- Updated dependencies [fd8c882]
  - @llamaindex/core@0.4.7

## 0.1.31

### Patch Changes

- Updated dependencies [4fc001c]
  - @llamaindex/env@0.1.20
  - @llamaindex/core@0.4.6

## 0.1.30

### Patch Changes

- Updated dependencies [ad85bd0]
  - @llamaindex/core@0.4.5
  - @llamaindex/env@0.1.19

## 0.1.29

### Patch Changes

- Updated dependencies [a8d3fa6]
  - @llamaindex/env@0.1.18
  - @llamaindex/core@0.4.4

## 0.1.28

### Patch Changes

- Updated dependencies [95a5cc6]
  - @llamaindex/core@0.4.3

## 0.1.27

### Patch Changes

- Updated dependencies [14cc9eb]
  - @llamaindex/env@0.1.17
  - @llamaindex/core@0.4.2

## 0.1.26

### Patch Changes

- Updated dependencies [9c73f0a]
  - @llamaindex/core@0.4.1

## 0.1.25

### Patch Changes

- Updated dependencies [359fd33]
- Updated dependencies [efb7e1b]
- Updated dependencies [98ba1e7]
- Updated dependencies [620c63c]
  - @llamaindex/core@0.4.0

## 0.1.24

### Patch Changes

- Updated dependencies [60b185f]
  - @llamaindex/core@0.3.7

## 0.1.23

### Patch Changes

- Updated dependencies [691c5bc]
  - @llamaindex/core@0.3.6

## 0.1.22

### Patch Changes

- Updated dependencies [fa60fc6]
  - @llamaindex/env@0.1.16
  - @llamaindex/core@0.3.5

## 0.1.21

### Patch Changes

- Updated dependencies [e2a0876]
  - @llamaindex/core@0.3.4

## 0.1.20

### Patch Changes

- Updated dependencies [0493f67]
  - @llamaindex/core@0.3.3

## 0.1.19

### Patch Changes

- Updated dependencies [4ba2cfe]
  - @llamaindex/env@0.1.15
  - @llamaindex/core@0.3.2

## 0.1.18

### Patch Changes

- a75af83: refactor: move some llm and embedding to single package
- Updated dependencies [ae49ff4]
- Updated dependencies [a75af83]
  - @llamaindex/env@0.1.14
  - @llamaindex/core@0.3.1

## 0.1.17

### Patch Changes

- Updated dependencies [1364e8e]
- Updated dependencies [96fc69c]
  - @llamaindex/core@0.3.0

## 0.1.16

### Patch Changes

- 6a9a7b1: fix: take init api key into account

## 0.1.15

### Patch Changes

- Updated dependencies [5f67820]
  - @llamaindex/core@0.2.12

## 0.1.14

### Patch Changes

- Updated dependencies [ee697fb]
  - @llamaindex/core@0.2.11

## 0.1.13

### Patch Changes

- Updated dependencies [3489e7d]
- Updated dependencies [468bda5]
  - @llamaindex/core@0.2.10

## 0.1.12

### Patch Changes

- 2a82413: fix(core): set `Settings.llm` to OpenAI by default and support lazy load openai

## 0.1.11

### Patch Changes

- Updated dependencies [b17d439]
  - @llamaindex/core@0.2.9

## 0.1.10

### Patch Changes

- Updated dependencies [df441e2]
  - @llamaindex/core@0.2.8
  - @llamaindex/env@0.1.13

## 0.1.9

### Patch Changes

- 96f72ad: fix: openai streaming with token usage and finish_reason
- Updated dependencies [6cce3b1]
  - @llamaindex/core@0.2.7

## 0.1.8

### Patch Changes

- Updated dependencies [8b7fdba]
  - @llamaindex/core@0.2.6

## 0.1.7

### Patch Changes

- Updated dependencies [d902cc3]
  - @llamaindex/core@0.2.5

## 0.1.6

### Patch Changes

- Updated dependencies [b48bcc3]
  - @llamaindex/core@0.2.4
  - @llamaindex/env@0.1.12

## 0.1.5

### Patch Changes

- Updated dependencies [2cd1383]
  - @llamaindex/core@0.2.3

## 0.1.4

### Patch Changes

- Updated dependencies [749b43a]
  - @llamaindex/core@0.2.2

## 0.1.3

### Patch Changes

- Updated dependencies [ac07e3c]
- Updated dependencies [70ccb4a]
- Updated dependencies [1a6137b]
- Updated dependencies [ac07e3c]
  - @llamaindex/core@0.2.1
  - @llamaindex/env@0.1.11

## 0.1.2

### Patch Changes

- Updated dependencies [11feef8]
  - @llamaindex/core@0.2.0

## 0.1.1

### Patch Changes

- 7edeb1c: feat: decouple openai from `llamaindex` module

  This should be a non-breaking change, but just you can now only install `@llamaindex/openai` to reduce the bundle size in the future
