"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      prevent: (node: Element) => node.hasAttribute("data-lenis-prevent"),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const onStop = () => lenis.stop();
    const onStart = () => lenis.start();
    window.addEventListener("lenis:stop", onStop);
    window.addEventListener("lenis:start", onStart);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      window.removeEventListener("lenis:stop", onStop);
      window.removeEventListener("lenis:start", onStart);
    };
  }, []);

  return <>{children}</>;
}
