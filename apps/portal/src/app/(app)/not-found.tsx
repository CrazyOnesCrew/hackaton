"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { isPortalRole, roleHome } from "@/lib/navigation";

gsap.registerPlugin(useGSAP);

const GRADIENT = {
  backgroundImage: "linear-gradient(135deg, #b9a5f5 0%, #8b74e8 60%, #f5a623 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

// Animated 404 (GSAP). Renders inside the admin Shell. All motion uses
// transforms/opacity only (compositor-friendly) per gsap-performance, with a
// quickTo pointer-parallax and prefers-reduced-motion handled via matchMedia.
export default function NotFound() {
  const root = useRef<HTMLDivElement>(null);
  const digits = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const home = isPortalRole(user?.role) ? roleHome(user.role) : "/login";

  useGSAP(
    (_ctx, contextSafe) => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .from(".nf-digit", { yPercent: 60, opacity: 0, scale: 0.7, rotationX: -50, transformOrigin: "50% 100%", stagger: 0.12, duration: 0.75, ease: "back.out(1.7)" })
          .from(".nf-line", { y: 18, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.25")
          .from(".nf-cta", { y: 12, opacity: 0, duration: 0.45, ease: "power2.out" }, "-=0.2");

        // Continuous gentle float (transform-only, reused tween).
        gsap.to(".nf-digit", {
          yPercent: -8,
          duration: 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.18, from: "center" },
          delay: 1,
        });

        // Pointer parallax — quickTo reuses one tween per axis (no per-event tweens).
        const xTo = gsap.quickTo(digits.current, "x", { duration: 0.6, ease: "power3" });
        const yTo = gsap.quickTo(digits.current, "y", { duration: 0.6, ease: "power3" });
        const onMove = contextSafe!((e: PointerEvent) => {
          const r = root.current!.getBoundingClientRect();
          xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * 26);
          yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * 26);
        });
        root.current!.addEventListener("pointermove", onMove);
        return () => root.current?.removeEventListener("pointermove", onMove);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(".nf-digit, .nf-line, .nf-cta", { opacity: 0, duration: 0.4, stagger: 0.05 });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative flex min-h-[74vh] w-full flex-col items-center justify-center overflow-hidden text-center">
      <div className="gradient-orb left-1/2 top-1/4 h-72 w-72 -translate-x-1/2" style={{ background: "var(--color-primary)" }} />

      <div ref={digits} className="relative flex select-none items-center gap-2 sm:gap-4" style={{ perspective: 800 }}>
        {["4", "0", "4"].map((d, i) => (
          <span
            key={i}
            className="nf-digit font-black leading-none [will-change:transform]"
            style={{ ...GRADIENT, fontSize: "clamp(6rem, 22vw, 13rem)" }}
          >
            {d}
          </span>
        ))}
      </div>

      <h1 className="nf-line relative mt-2 text-xl font-bold tracking-tight sm:text-2xl" style={{ color: "var(--fg)" }}>
        Página no encontrada
      </h1>
      <p className="nf-line relative mt-2 max-w-md text-sm" style={{ color: "var(--fg-muted)" }}>
        La ruta que buscas no existe o fue movida. Comprueba la dirección o vuelve al panel.
      </p>

      <div className="nf-cta relative mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={home}
          className="inline-flex items-center gap-2 rounded-pill px-5 py-2 text-sm font-bold text-ink transition-all hover:brightness-105"
          style={{ background: "var(--color-primary)" }}
        >
          <ArrowLeft size={16} /> Volver al panel
        </Link>
      </div>
    </div>
  );
}
