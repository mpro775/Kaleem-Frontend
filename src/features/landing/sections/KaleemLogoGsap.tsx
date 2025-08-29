// KaleemLogoGsapProSafe.tsx
import { useLayoutEffect, useRef } from "react";
import { ReactSVG } from "react-svg";
import gsap from "gsap";

type Props = {
  src?: string;
  size?: number;
  speed?: number;
  float?: boolean;
  hoverBoost?: boolean;
};

export default function KaleemLogoGsapProSafe({
  src = "/kaleem2.svg",
  size = 180,
  speed = 1,
  float = true,
  hoverBoost = true,
}: Props) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (document.getElementById("kaleem-gsap-style")) return;
    const s = document.createElement("style");
    s.id = "kaleem-gsap-style";
    s.textContent = `
      .kaleem-svg{width:100%;height:100%;display:block}
      .kaleem-svg .hand,.kaleem-svg .eye,.kaleem-svg .antenna,.kaleem-svg .outline,.kaleem-svg .shadow{
        transform-box: fill-box;
      }
    `;
    document.head.appendChild(s);
  }, []);

  const dur = (d: number) => d / Math.max(0.0001, speed);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // const purple = new Set(["#502E91", "#6C3EF2", "#7C4DFF", "#5A31A5", "#7038D1"]);
  const bb = (el: Element) => {
    try { return (el as SVGGraphicsElement).getBBox(); } catch { return null; }
  };

  const afterInjection = (svg: SVGSVGElement) => {
    if (!svg || !root.current) return;
    svg.classList.add("kaleem-svg");

    // outline + glow
  

  

    // pick antenna (top-most) + shadow (ellipse)
    const antenna =
      svg.querySelector<SVGGraphicsElement>("#antenna") ||
      (() => {
        let c: SVGGraphicsElement | null = null;
        svg.querySelectorAll<SVGGraphicsElement>("path,g").forEach(el => {
          const b = bb(el); if (!b) return;
          if (!c || b.y < bb(c)!.y) c = el;
        });
        return c;
      })();

    const shadow = svg.querySelector<SVGGraphicsElement>("ellipse");

    // eyes
    const eyes: SVGGraphicsElement[] = Array.from(
      svg.querySelectorAll<SVGGraphicsElement>("#eye_left,#eye_right,.eye")
    );
    if (eyes.length === 0) {
      svg.querySelectorAll<SVGGraphicsElement>('path[fill="white"],path[fill="#ffffff"],circle[fill="white"],ellipse[fill="white"]').forEach(el => {
        const b = bb(el); if (b && b.width < 50 && b.height < 50) eyes.push(el);
      });
    }

    // animations
    if (!reduce) {
      gsap.fromTo(svg, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: dur(0.6), ease: "power2.out" });

      if (float) {
        gsap.to(svg, { y: -6, duration: dur(1.8), yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

   

      if (antenna) {
        const b = bb(antenna);
        if (b) gsap.set(antenna, { svgOrigin: `${b.x + b.width / 2} ${b.y + b.height}` });
        gsap.to(antenna, { y: -3, rotation: 2, duration: dur(0.5), yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      if (shadow) {
        const b = bb(shadow);
        if (b) gsap.set(shadow, { svgOrigin: `${b.x + b.width / 2} ${b.y + b.height / 2}` });
        gsap.to(shadow, { scaleX: 1.06, opacity: 0.8, duration: dur(1.8), yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

    

      if (eyes.length) {
        const blink = () => {
          gsap.to(eyes, {
            scaleY: 0.08,
            duration: dur(0.08),
            yoyo: true,
            repeat: 1,
            transformOrigin: "50% 50%",
            onComplete: () => { gsap.delayedCall(1.6 + Math.random() * 1.6, blink); }
          });
        };
        gsap.delayedCall(0.8, blink);
      }

      // hover boost
      if (hoverBoost && root.current) {
        const enter = () => gsap.to(root.current!, { scale: 1.04, duration: 0.2, ease: "power2.out" });
        const leave = () => gsap.to(root.current!, { scale: 1, duration: 0.3, ease: "power2.out" });
        root.current.addEventListener("mouseenter", enter);
        root.current.addEventListener("mouseleave", leave);
        // cleanup
        const cleanup = () => {
          root.current?.removeEventListener("mouseenter", enter);
          root.current?.removeEventListener("mouseleave", leave);
        };
        // إزالة عند unmount
        (root.current as any).__cleanup = cleanup;
      }
    }
  };

  useLayoutEffect(() => {
    return () => {
      const c = (root.current as any)?.__cleanup;
      if (typeof c === "function") c();
    };
  }, []);

  return (
    <div ref={root} style={{ width: size, height: size, display: "inline-block" }}>
      <ReactSVG src={src} afterInjection={afterInjection} loading={() => null} />
    </div>
  );
}
