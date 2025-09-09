import SignalTask from "@/components/SignalTask";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import NoiseTask from "./components/NoiseTask";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SheetDemo } from "./components/AttendanceDrawer";

export default function App() {
  const [privacyMode, setPrivacyMode] = useState(() => {
    const stored = localStorage.getItem("privacyMode");
    return stored ? stored === "true" : false;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on "p" or "cmd+p"
      if (e.metaKey && e.key.toLowerCase() === "p") {
        e.preventDefault(); // prevent default print shortcut
        setPrivacyMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem("privacyMode", privacyMode.toString());
  }, [privacyMode]);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="flex justify-between mb-4">
        <div className="mr-4">
          <SheetDemo />
        </div>
        <Button onClick={() => setPrivacyMode(!privacyMode)}>
          {privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
        </Button>
      </div>

      <div className={`${privacyMode && "blur-sm pointer-events-none"}`}>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[80vh] w-full"
        >
          <ResizablePanel defaultSize={50} minSize={35} className="mr-0.5">
            <div className="border border-white/50 rounded-2xl p-4 bg-black h-full">
              <SignalTask />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-0.5 bg-black hover:bg-blue-400" />

          <ResizablePanel defaultSize={50} minSize={35} className="ml-0.5">
            <div className="border border-white/50 rounded-2xl p-4 bg-black h-full">
              <NoiseTask />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
