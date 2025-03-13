import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Download, Share, X } from "lucide-react";
import html2canvas from "html2canvas";

interface ScreenshotButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  contentTitle: string;
}

const ScreenshotButton = ({
  targetRef,
  contentTitle,
}: ScreenshotButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTaking, setIsTaking] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const takeScreenshot = async () => {
    if (!targetRef.current) return;

    try {
      setIsTaking(true);

      // Find the video container element
      const videoContainer = targetRef.current.querySelector(".aspect-video");
      const element = videoContainer || targetRef.current;

      // Configure html2canvas with better options for capturing iframe content
      const canvas = await html2canvas(element, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#000",
        scale: 1.5, // Higher quality
        foreignObjectRendering: false, // Disable foreignObject which can cause issues
        onclone: (clonedDoc) => {
          // Try to make iframes visible in the clone
          const iframes = clonedDoc.querySelectorAll("iframe");
          iframes.forEach((iframe) => {
            if (iframe.style) {
              iframe.style.visibility = "visible";
              iframe.style.opacity = "1";
            }
          });
        },
      });

      const image = canvas.toDataURL("image/png");
      setScreenshot(image);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error taking screenshot:", error);
      alert(
        "Could not capture screenshot. This may be due to security restrictions with the video player.",
      );
    } finally {
      setIsTaking(false);
    }
  };

  const downloadScreenshot = () => {
    if (!screenshot) return;

    const link = document.createElement("a");
    link.href = screenshot;
    link.download = `${contentTitle.replace(/\s+/g, "_")}_screenshot.png`;
    link.click();
  };

  const shareScreenshot = async () => {
    if (!screenshot) return;

    try {
      // Convert base64 to blob
      const response = await fetch(screenshot);
      const blob = await response.blob();

      if (navigator.share) {
        await navigator.share({
          title: `Screenshot from ${contentTitle}`,
          files: [
            new File([blob], `${contentTitle}_screenshot.png`, {
              type: "image/png",
            }),
          ],
        });
      } else {
        // Fallback if Web Share API is not available
        downloadScreenshot();
      }
    } catch (error) {
      console.error("Error sharing screenshot:", error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-gray-800"
        onClick={takeScreenshot}
        disabled={isTaking}
      >
        <Camera className="h-5 w-5" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-3xl">
          <DialogHeader>
            <DialogTitle>Screenshot</DialogTitle>
            <DialogDescription>
              Screenshot captured from {contentTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="relative overflow-hidden rounded-md border border-gray-700 bg-black">
            {screenshot && (
              <img
                ref={imageRef}
                src={screenshot}
                alt="Screenshot"
                className="w-full h-auto"
              />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="gap-2"
              onClick={downloadScreenshot}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button className="gap-2" onClick={shareScreenshot}>
              <Share className="h-4 w-4" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScreenshotButton;
