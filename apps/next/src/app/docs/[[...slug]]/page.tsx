import { ChatDemoRSC } from "@/components/demo/chat/rsc/demo";
import * as demos from "@/components/demo/lazy";
import { createMetadata, metadataImage } from "@/lib/metadata";
import { openapi, source } from "@/lib/source";
import * as Icons from "@icons-pack/react-simple-icons";
import { APIPage } from "fumadocs-openapi/ui";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import { createGenerator } from "fumadocs-typescript";
import { AutoTypeTable } from "fumadocs-typescript/ui";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";

const generator = createGenerator();

export const revalidate = false;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const { body: MDX, toc, lastModified } = await page.data.load();

  return (
    <DocsPage
      toc={toc}
      full={page.data.full}
      lastUpdate={lastModified}
      editOnGithub={{
        owner: "run-llama",
        repo: "LlamaIndexTS",
        sha: "main",
        path: `apps/next/src/content/docs/${page.file.path}`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...Icons,
            ...defaultMdxComponents,
            ...demos,
            ChatDemoRSC,
            Accordion,
            Accordions,
            APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
            Tab,
            Tabs,
            Popup,
            PopupContent,
            PopupTrigger,
            AutoTypeTable: (props) => (
              <AutoTypeTable generator={generator} {...props} />
            ),
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
