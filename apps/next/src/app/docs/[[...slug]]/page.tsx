import { createMetadata, metadataImage } from "@/lib/metadata";
import { openapi, source } from "@/lib/source";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import { createTypeTable } from "fumadocs-typescript/ui";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";

export const revalidate = false;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const { AutoTypeTable } = createTypeTable();
  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      lastUpdate={page.data.lastModified}
      editOnGithub={{
        owner: "run-llama",
        repo: "LlamaIndexTS",
        sha: "mian",
        path: `apps/next/src/content/docs/${page.file.path}`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            APIPage: openapi.APIPage,
            Tab,
            Tabs,
            Popup,
            PopupContent,
            PopupTrigger,
            AutoTypeTable,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return createMetadata(
    metadataImage.withImage(page.slugs, {
      metadataBase: new URL("https://ts.llamaindex.ai"),
      title: page.data.title,
      description: page.data.description,
      openGraph: {
        url: `/docs/${page.slugs.join("/")}`,
      },
    }),
  );
}
