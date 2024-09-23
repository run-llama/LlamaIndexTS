import { AsyncLocalStorage } from '@llamaindex/env'
import { createStreamableUI } from 'ai/rsc'
import {
	Settings,
	CallbackManager,
	type LlamaIndexEventMaps
} from '@llamaindex/core/global';
import type { ComponentType, ReactNode } from 'react';

const uiAsyncLocalStorage = new AsyncLocalStorage()

type UIMap = {
	[K in keyof LlamaIndexEventMaps]?: ComponentType<{
		data: LlamaIndexEventMaps[K]
	}>
}

export type UIOptions = {
	initial?: ReactNode
	on: UIMap
}

export function run<T>(
	fn: () => Promise<T>,
	options: UIOptions
): {
	result: Promise<T>,
	ui: ReactNode
} {
	// todo: bypass to the original callback manager
	// rootCM = Settings.callbackManager
	const abortController = new AbortController()
	const cm = new CallbackManager()
	const streamableUI = createStreamableUI(options.initial)
	const loading: UIMap = options.on ?? {}
	Object.keys(loading).forEach((key) => {
		cm.on(key as keyof LlamaIndexEventMaps, (event) => {
			const data = event.detail
			const Component = key in loading ? loading[key as keyof LlamaIndexEventMaps] : null
			if (Component != null) {
				streamableUI.update(<Component data={data as any}/>)
			}
		}, {
			signal: abortController.signal
		})
	})
	const resultPromise = Settings.withCallbackManager(cm, async () => {
		const response = await uiAsyncLocalStorage.run(streamableUI, fn)
		abortController.abort()
		streamableUI.done()
		return response
	})
	.catch((error) => {
		streamableUI.error(error)
		throw error
	})
	return {
		result: resultPromise,
		ui: streamableUI.value
	}
}
