"use client";

import { useEffect, useRef } from "react";

const floatingBooks = [
  {
    className: "magic-floating-folio",
    depth: 7,
    src: "/samunmong/assets/magic-school/intro/atmosphere/floating-folio-v1.webp"
  },
  {
    className: "magic-floating-grimoire-closed",
    depth: 11,
    src: "/samunmong/assets/magic-school/intro/atmosphere/floating-grimoire-closed-v1.webp"
  },
  {
    className: "magic-floating-grimoire-open",
    depth: 17,
    src: "/samunmong/assets/magic-school/intro/atmosphere/floating-grimoire-open-v1.webp"
  }
] as const;

export default function MagicSchoolIntroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-magic-book-depth]"));
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = 0;

    const updatePointer = (event: PointerEvent) => {
      targetX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      targetY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.magicBookDepth || 0);
        layer.style.setProperty("--magic-book-shift-x", `${currentX * depth}px`);
        layer.style.setProperty("--magic-book-shift-y", `${currentY * depth * 0.56}px`);
      });

      animationFrame = window.requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="magic-intro-atmosphere" ref={rootRef} aria-hidden="true">
      {floatingBooks.map((book) => (
        <span
          className={`magic-floating-book-layer ${book.className}`}
          data-magic-book-depth={book.depth}
          key={book.className}
        >
          <img src={book.src} alt="" draggable={false} loading="eager" decoding="async" />
        </span>
      ))}
    </div>
  );
}
