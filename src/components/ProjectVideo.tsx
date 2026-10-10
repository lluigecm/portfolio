"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoMedia } from "@/content/projects";
import type { Content } from "@/types/content";

interface Props {
  media: VideoMedia;
  alt: string;
  credit?: string;
  labels: Content["ui"]["video"];
}

/*
 * Vídeo curto sem som, em loop, com botão de pausa (regra 18, WCAG 2.2.2).
 * Sem o atributo autoplay: quem toca é o script, e só se o visitante não
 * pediu menos movimento. Até lá, e com prefers-reduced-motion, fica a capa.
 */
export function ProjectVideo({ media, alt, credit, labels }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Navegadores que bloqueiam a reprodução automática deixam a capa e o botão.
    ref.current?.play().catch(() => {});
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  return (
    <figure className="border-b border-linha">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block h-auto w-full"
      >
        <source src={media.webm} type="video/webm" />
        <source src={media.mp4} type="video/mp4" />
        {alt}
      </video>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-linha px-5 py-1 text-xs text-lapis md:px-6">
        <button
          type="button"
          onClick={toggle}
          className="-ml-2 inline-flex items-center gap-2 rounded-md px-2 py-2 text-grafite"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
            {playing ? <path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z" /> : <path d="M4 2l10 6-10 6z" />}
          </svg>
          {playing ? labels.pause : labels.play}
        </button>
        {credit && <span>{credit}</span>}
      </figcaption>
    </figure>
  );
}
