import { baseOptions } from "@/app/layout.config";
import { Footer } from "@/components/website/Footer";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";

export default function Layout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <HomeLayout {...baseOptions}>
      {children}
      <div className="container">
        <Footer />
      </div>
    </HomeLayout>
  );
}
