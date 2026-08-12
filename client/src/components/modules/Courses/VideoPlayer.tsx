"use client";

import { getYoutubeId } from "@/lib/utils";

interface VideoPlayerProps {
  url: string;
  title?: string;
}

const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-canvas-soft">
        <p className="text-sm text-mute-text">No video available yet.</p>
      </div>
    );
  }

  const youtubeId = getYoutubeId(url);

  if (youtubeId) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-canvas-soft">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }

  if (url.includes("vimeo")) {
    const vimeoId = url.split("/").pop();
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-canvas-soft">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title || "Video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }

  const extension = url.split("?")[0].split(".").pop()?.toLowerCase();
  const mimeType =
    extension === "webm"
      ? "video/webm"
      : extension === "ogg"
        ? "video/ogg"
        : extension === "mov"
          ? "video/quicktime"
          : "video/mp4";

  return (
    <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-canvas-soft">
      <video controls className="size-full">
        <source src={url} type={mimeType} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
