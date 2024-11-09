import { createMetadataImage } from 'fumadocs-core/server';
import { source } from '@/lib/source';
import { Metadata } from 'next';

export const metadataImage = createMetadataImage({
	source,
	imageRoute: 'og',
});

export function createMetadata(override: Metadata): Metadata {
	return {
		...override,
		openGraph: {
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			url: 'https://ts.llamaindex.ai/',
			images: '/og.png',
			siteName: 'LlamaIndex.TS',
			...override.openGraph,
		},
		twitter: {
			card: 'summary_large_image',
			creator: '@llama_index',
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			images: '/og.png',
			...override.twitter,
		},
	};
}