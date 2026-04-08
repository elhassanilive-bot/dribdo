"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";

export default function LottieReactionIcon({ file, size = 24, loop = false, autoplay = true, className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (!hostRef.current || !file) return undefined;

    const anim = lottie.loadAnimation({
      container: hostRef.current,
      renderer: "svg",
      loop,
      autoplay,
      path: `/dribdo-assets/lottie/${file}`,
    });

    return () => {
      anim.destroy();
    };
  }, [file, loop, autoplay]);

  return <span ref={hostRef} className={className} style={{ width: size, height: size, display: "inline-block" }} aria-hidden="true" />;
}
