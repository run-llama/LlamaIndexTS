import { createMetadata, metadataImage } from "@/lib/metadata";
import { openapi, source } from "@/lib/source";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            APIPage: openapi.APIPage,
            Popup,
            PopupContent,
            PopupTrigger,
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
      title: page.data.title,
      description: page.data.description,
      openGraph: {
        url: `/docs/${page.slugs.join("/")}`,
      },
    }),
  );
}
