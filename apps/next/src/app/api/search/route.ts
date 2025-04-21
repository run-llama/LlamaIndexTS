import { source } from "@/lib/source";
import { structure } from "fumadocs-core/mdx-plugins";
import { createFromSource } from "fumadocs-core/search/server";

// TODO: migrate to another search service, I don't think Vercel can handle that many of documents.
export const { GET } = createFromSource(source, (page) => ({
  id: page.url,
  title: page.data.title,
  description: page.data.description,
  url: page.url,
  structuredData: structure(page.data.content),
}));
