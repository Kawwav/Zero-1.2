import { useEffect, useRef } from "react";
import "./footer.css";

const SOCIAL_LINKS = [
  { id: "instagram", label: "Instagram", alt: "Instagram", href: "https://instagram.com/seuusuario" },
  { id: "linkedin", label: "LinkedIn", alt: "LinkedIn", href: "https://linkedin.com/company/suaempresa" },
];

/* Componente reutilizável de texto com efeito reveal */
function RevealText({ primary, alt, className = "" }) {
  return (
    <span className={`link-reveal ${className}`}>
      <span className="text-primary">{primary}</span>
      <span className="text-alt" aria-hidden="true">{alt}</span>
    </span>
  );
}

export default function Footer() {
  const titleRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    const items = [titleRef.current, emailRef.current].filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            entry.target.classList.remove("hidden");
          } else {
            entry.target.classList.remove("visible");
            entry.target.classList.add("hidden");
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer" id="contato">
      <div className="footer-top">
        <a href="mailto:contato@empresa.com" className="footer-eyebrow">
          <RevealText primary="Entre em contato" alt="Entre em contato" />
        </a>

        <h2 className="footer-title" ref={titleRef}>
          Vamos
          <br />
          <em>trabalhar juntos</em>
        </h2>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <a
          href="mailto:contato@empresa.com"
          className="footer-email"
          ref={emailRef}
        >
          <RevealText
            primary="contato@empresa.com"
            alt="contato@empresa.com"
          />
        </a>

        <div className="footer-social">
          <span className="footer-social-label">Social</span>
          <ul className="footer-social-list">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  <RevealText primary={s.label} alt={s.alt} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}