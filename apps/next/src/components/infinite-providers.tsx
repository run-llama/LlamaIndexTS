import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { SiAnthropic, SiOpenai } from "@icons-pack/react-simple-icons";
import Image from "next/image";

export function InfiniteLLMProviders() {
  return (
    <InfiniteSlider gap={24} reverse>
      <SiOpenai className="h-[60px] w-auto" />
      <Image
        src="/icons/Google_2015_logo.svg"
        alt="Google"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
      <Image
        src="/icons/Microsoft_Azure.svg"
        alt="Microsoft Azure"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
      <SiAnthropic className="h-[60px] w-auto" />
      <Image
        src="/icons/Amazon_Web_Services_Logo.svg"
        alt="Amazon Web Services"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
      <Image
        src="/icons/Groq_Logo.svg"
        alt="Groq"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
    </InfiniteSlider>
  );
}

export function InfiniteVectorStoreProviders() {
  return (
    <InfiniteSlider gap={24}>
      <Image
        src="/icons/postgresql-ar21.svg"
        alt="PostgreSQL"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
      <Image
        src="/icons/Datastax_logo.svg"
        alt="Datastax"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
      <Image
        src="/icons/chroma.svg"
        alt="Chroma"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
      <Image
        src="/icons/weaviate-nav-logo-light.svg"
        alt="Weaviate"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
      <Image
        src="/icons/qdrant-logo.svg"
        alt="Qdrant"
        width={60}
        height={60}
        className="h-[60px] w-auto"
      />
    </InfiniteSlider>
  );
}
