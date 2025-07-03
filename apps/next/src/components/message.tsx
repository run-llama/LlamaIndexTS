"use client";

import { cn } from "@/libs/utils";
import Image from "next/image";
import { ReactNode } from "react";
import { IconAI, IconUser } from "./ui/icons";

export function UserMessage({ children }: { children: ReactNode }) {
  return (
    <div className="group relative flex items-start">
      <div className="bg-background flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        <IconUser />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function BotMessage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative flex items-start", className)}>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
        <Image
          src="/logo-large.png"
          alt="Logo"
          className="size-4"
          width={147}
          height={147}
        />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function BotCard({
  children,
  showAvatar = true,
}: {
  children: ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          "bg-primary text-primary-foreground flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm",
          !showAvatar && "invisible",
        )}
      >
        <IconAI />
      </div>
      <div className="ml-4 flex-1 px-1">{children}</div>
    </div>
  );
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        "mt-2 flex items-center justify-center gap-2 text-xs text-gray-500"
      }
    >
      <div className={"max-w-[600px] flex-initial px-2 py-2"}>{children}</div>
    </div>
  );
}
