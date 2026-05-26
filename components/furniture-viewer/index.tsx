"use client";

import dynamic from "next/dynamic";
import { FurnitureProvider } from "@/lib/furniture-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

const Scene = dynamic(
  () => import("./scene").then((mod) => mod.Scene),
  { ssr: false }
);

export function FurnitureViewer() {
  return (
    <FurnitureProvider>
      <div className="relative h-screen w-full overflow-hidden bg-[#1a1a2e]">
        <Header />
        <Sidebar />
        <Scene />
      </div>
    </FurnitureProvider>
  );
}
