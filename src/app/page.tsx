"use client";

import { CVProvider, useCV } from "@/lib/cv-context";
import { GalleryScreen } from "@/screens/GalleryScreen";
import { FormScreen } from "@/screens/FormScreen";
import { PreviewScreen } from "@/screens/PreviewScreen";

function Screens() {
  const { cv } = useCV();
  if (cv.screen === "gallery") return <GalleryScreen />;
  if (cv.screen === "form") return <FormScreen />;
  return <PreviewScreen />;
}

export default function Home() {
  return (
    <CVProvider>
      <Screens />
    </CVProvider>
  );
}
