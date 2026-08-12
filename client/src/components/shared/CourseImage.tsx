"use client";

import { useState } from "react";
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
