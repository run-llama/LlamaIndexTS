import { describe, test } from 'vitest'
import { z } from 'zod'
import { FunctionTool } from '@llamaindex/core/tools'

describe('function-tool', () => {
  test('zod type check', () => {
    const inputSchema = z.object({
      name: z.string(),
      age: z.number(),
    })
    FunctionTool.from((input) => {
      return 'Hello ' + input.name + ' ' + input.age
    }, {
      name: 'get-user',
      description: 'Get user by name and age',
      parameters: inputSchema,
    })
  })
})