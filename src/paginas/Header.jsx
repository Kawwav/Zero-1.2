import { useEffect, useRef, useState } from "react";
import "./Header.css";

const SLIDES = ["1.jpg", "2.jpg"];
const SLIDE_DURATION = 5000; // tempo de tela de cada imgem fundo

export default function Header() {
  const screenRef = useRef(null);
  const logoRef = useRef(null);
  const animatedRef = useRef(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);


  useEffect(() => {
    const screenEl = screenRef.current;
    if (!screenEl || screenEl.dataset.animated) return;
    screenEl.dataset.animated = "true";

    const loadGSAP = () =>
      new Promise((resolve) => {
        if (window.gsap) return resolve(window.gsap);
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
        script.onload = () => resolve(window.gsap);
        document.head.appendChild(script);
      });

    loadGSAP().then((gsap) => {
      const screen = screenRef.current;
      if (!screen) return;

      const container = screen.querySelector(".loading-text");
      container.innerHTML = "";

      const text = "Conecte seus produtos ao público certo";
      const words = text.split(" ");
      const spans = [];

      words.forEach((word, wi) => {
        const outer = document.createElement("span");
        outer.className = "span-outer";
        const inner = document.createElement("span");
        inner.className = "span-inner";
        inner.textContent = word;
        outer.appendChild(inner);
        container.appendChild(outer);

        if (wi < words.length - 1) {
          const space = document.createElement("span");
          space.className = "space";
          space.textContent = "\u00A0";
          container.appendChild(space);
        }

        spans.push(inner);
      });

      gsap.set(spans, { y: "110%", rotation: 10, transformOrigin: "left bottom" });

      const tl = gsap.timeline({ delay: 0.4 });

      tl.to(spans, {
        y: "0%",
        rotation: 0,
        duration: 1,
        ease: "expo.out",
        stagger: { each: 0.05, from: "start" },
      });

      tl.to(
        spans,
        {
          y: "-200%",
          rotation: 0,
          duration: 1,
          ease: "power2.in",
          stagger: { each: 0.05, from: "end" },
        },
        "+=0.1"
      );

      tl.to(
        screen,
        {
          y: "-100%",
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            screen.remove();
            setHeroVisible(true);
            const logo = logoRef.current;
            if (logo) {
              gsap.fromTo(
                logo,
                { y: -80, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  ease: "back.out(1.4)",
                  delay: 0.1,
                }
              );
            }
          },
        },
        "-=0.2"
      );
    });

    return () => {};
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="loading-screen" ref={screenRef}>
        <div className="loading-text-wrap">
          <div className="loading-text" />
        </div>
      </div>

      <section className="hero">
        <div className="hero-bg">
          {SLIDES.map((src, i) => (
            <div
              key={src}
              className={`hero-slide${i === currentSlide ? " active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="hero-overlay" />

        <img
          src="Logo.png"
          alt="Logo"
          className="hero-logo"
          ref={logoRef}
          style={{ opacity: 0 }}
        />

        <div className={`hero-content${heroVisible ? " visible" : ""}`}>
          <h1 className="hero-title">
            Conecte seus produtos ao público certo
          </h1>
          <p className="hero-subtitle">
            Na <span className="brand-accent">.Zero</span>, somos especialistas 
            em gerar informações e performar em <span className="brand-accent">resultados</span>
          </p>
        </div>

      </section>
    </>
  );
}