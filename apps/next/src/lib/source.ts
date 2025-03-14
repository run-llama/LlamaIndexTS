import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createOpenAPI } from "fumadocs-openapi/server";

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export const openapi = createOpenAPI();
