import { DOCUMENT_URL } from "@/lib/const";
import { redirect } from "next/navigation";

export default async function Page(props: {
  params: Promise<{
    any: string[];
  }>;
}) {
  const path = await props.params.then(({ any }) => any.join("/"));
  return redirect(new URL(path, DOCUMENT_URL).toString());
}
