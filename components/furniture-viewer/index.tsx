"use client";

import dynamic from "next/dynamic";
import { FurnitureProvider } from "@/lib/furniture-context";
import { RecordingProvider } from "@/lib/recording-context";
import { ImageCaptureProvider } from "@/lib/image-capture-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

const Scene = dynamic(
  () => import("./scene").then((mod) => mod.Scene),
  { ssr: false }
);

export function FurnitureViewer() {
  return (
    <FurnitureProvider>
      <RecordingProvider>
        <ImageCaptureProvider>
          <div className="relative h-screen w-full overflow-hidden bg-[#1a1a2e]">
            <Header />
            <Sidebar />
            <Scene />
          </div>
        </ImageCaptureProvider>
      </RecordingProvider>
    </FurnitureProvider>
  );
}
