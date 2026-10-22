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

// Fração do vídeo que precisa estar na tela para ele tocar.
const VISIBLE_THRESHOLD = 0.25;

/*
 * Vídeo curto sem som, em loop, com botão de pausa (regra 18, WCAG 2.2.2).
 *
 * Nasce só com a capa, sem fontes: nada é baixado até o vídeo aparecer na
 * tela (ou até o visitante pedir para tocar). Toca só enquanto está visível,
 * para poupar processamento e bateria no celular. Com prefers-reduced-motion,
 * não toca sozinho; e uma pausa do visitante vale até ele mesmo tocar de novo.
 */
export function ProjectVideo({ media, alt, credit, labels }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const pausedByVisitor = useRef(false);
  const [sourcesLoaded, setSourcesLoaded] = useState(false);
  const [wanted, setWanted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return setWanted(false);
        if (reducedMotion || pausedByVisitor.current) return;
        setSourcesLoaded(true);
        setWanted(true);
      },
      { threshold: VISIBLE_THRESHOLD },
    );
    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourcesLoaded) return;
    // Navegadores que bloqueiam a reprodução automática deixam a capa e o botão.
    if (wanted) video.play().catch(() => {});
    else video.pause();
  }, [wanted, sourcesLoaded]);

  function toggle() {
    if (playing) {
      pausedByVisitor.current = true;
      setWanted(false);
      return;
    }
    pausedByVisitor.current = false;
    setSourcesLoaded(true);
    setWanted(true);
    // Já tocável: toca na hora, dentro do gesto do visitante.
    if (sourcesLoaded) videoRef.current?.play().catch(() => {});
  }

  return (
    <figure ref={figureRef} className="border-b border-linha">
      <video
        ref={videoRef}
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
        {sourcesLoaded && (
          <>
            <source src={media.webm} type="video/webm" />
            <source src={media.mp4} type="video/mp4" />
          </>
        )}
        {alt}
      </video>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-linha px-5 py-1 text-xs text-secundario md:px-6">
        <button
          type="button"
          onClick={toggle}
          className="-ml-2 inline-flex items-center gap-2 rounded-md px-2 py-2 text-texto"
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
