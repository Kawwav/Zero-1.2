import { useEffect, useRef, useState } from "react";
import "./about.css";
import SobrePanel from "./sobre";

export default function Sobre() {
  const headlineRef = useRef(null);
  const asideRef = useRef(null);
  const numberRef = useRef(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const items = [
      headlineRef.current,
      asideRef.current,
      numberRef.current,
    ].filter(Boolean);

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

  const handleSobreClick = (e) => {
    e.preventDefault();
    setPanelOpen(true);
  };

  const handleClose = () => {
    setPanelOpen(false);
  };

  return (
    <>
      <section className="sobre">
        <div className="sobre-inner">
          <h2 className="sobre-headline" ref={headlineRef}>
            A .Zero conecta{" "}<br className="sobre-break" />
            marcas ao{" "}<br className="sobre-break" />
            público{" "}<br className="sobre-break" />
            certo, no{" "}<br className="sobre-break" />
            momento{" "}<br className="sobre-break" />
            certo.
          </h2>

          <aside className="sobre-aside" ref={asideRef}>
            <p className="sobre-desc">
              Operamos degustações estratégicas em supermercados,
              feiras e atacadistas. Transformando o ponto de venda
              no palco principal da decisão de compra.
            </p>
            <a href="#sobre-nos" className="sobre-cta" onClick={handleSobreClick}>
              Sobre Nós
            </a>
          </aside>
        </div>

        <div className="sobre-info-footer">
          <div className="sobre-number" ref={numberRef}>01</div>
        </div>
        <div className="sobre-linha-final" />
      </section>

      {panelOpen && <SobrePanel onClose={handleClose} />}
    </>
  );
}