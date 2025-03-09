import ContributorCounter from "@/components/contributor-count";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { ReactElement } from "react";

export function Contributing(): ReactElement {
  return (
    <div className="flex flex-col items-center border-x border-t px-4 py-16 text-center">
      <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
        Made possible by you <Heart className="inline align-middle" />
      </h2>
      <p className="text-fd-muted-foreground mb-4">
        LlamaIndex.TS is powered by the open source community.
      </p>
      <div className="mb-8 flex flex-row items-center gap-2">
        <a
          href="https://github.com/run-llama/LlamaIndexTS/graphs/contributors"
          rel="noreferrer noopener"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          See Contributors
        </a>
      </div>
      <ContributorCounter repoOwner="run-llama" repoName="LlamaIndexTS" />
    </div>
  );
}
