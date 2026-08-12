"use client";

import { useEffect, useState } from "react";
import Image, { ImageProps } from "next/image";

const PLACEHOLDER = "/images/placeholder-course.svg";

interface CourseImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

/**
 * CourseImage renders a next/image with a graceful onError fallback so a
 * broken or blocked thumbnail never leaves an empty frame on screen.
 */
const CourseImage = ({ src, alt, fallbackSrc = PLACEHOLDER, ...props }: CourseImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string | typeof src>(src);

  // Re-sync when the src prop changes (the same component instance can be
  // reused across courses, e.g. in carousels and paginated lists).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
};

export default CourseImage;
