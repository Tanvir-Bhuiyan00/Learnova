"use client";

import { getYoutubeId } from "@/lib/utils";

interface VideoPlayerProps {
  url: string;
  title?: string;
}

const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  const youtubeId = getYoutubeId(url);

  if (youtubeId) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg">
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
      <div className="aspect-video overflow-hidden rounded-lg">
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

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
      <video controls className="size-full" poster="">
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
