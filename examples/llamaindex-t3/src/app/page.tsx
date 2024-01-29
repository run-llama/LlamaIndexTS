import { unstable_noStore as noStore } from "next/cache";
import { AskQuestion } from "~/components/ask-question";

export default async function Home() {
  noStore();

  return (
    <main>
      <AskQuestion />
    </main>
  );
}
