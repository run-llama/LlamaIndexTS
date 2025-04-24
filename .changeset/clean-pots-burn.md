---
"@llamaindex/workflow": minor
---

refactor!: migrate to llamaflow

- remove `outputs` in workflow. You shuld use TypeScript and define returns type to validate the workflow correctly.
- remove `timeout` and `verbose` in workflow. Workflow now is a very lightly engine, so you should do this by youself. For example, `abortSignal.timeout`, `console.log`...
- `workflow.run` now retunrs `ReadableStream | Promise<WorkflowEvent<Result>>`, you shouldn't use steram and promise in both time.
