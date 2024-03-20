import type { LLM } from './llm/types.js'

export class Usage {
  private chatWeakMap: WeakMap<LLM, LLM['chat']> = new WeakMap()
  private completeWeakMap: WeakMap<LLM, LLM['complete']> = new WeakMap()
  public track (
    llm: LLM
  ) {
    const originalChat: LLM['chat'] = llm.chat
    const originalComplete: LLM['complete'] = llm.complete
    this.chatWeakMap.set(llm, originalChat)
    this.completeWeakMap.set(llm, originalComplete)
    // @ts-expect-error
    const chat: LLM['chat'] = async function chat(...args) {
      const { messages }  = args[0]
      return originalChat.apply(
        llm,
        // @ts-expect-error
        args
      )
    }
    // @ts-expect-error
    const complete: LLM['complete'] = async function complete(...args) {
      const { prompt }  = args[0]
      const tokens = llm.tokens(prompt)
      return originalComplete.apply(
        llm,
        // @ts-expect-error
        args
      )
    }
    llm.chat = chat
    llm.complete = complete
  }
}