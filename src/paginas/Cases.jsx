import { useEffect, useRef } from "react";
import "./Cases.css";

const CASES = [
  {
    id: "01",
    brand: "Nugali",
    tag: "Degustação",
    local: "Festval — Curitiba, PR",
    bg: "./1.jpg",
    stats: [
      { val: "+340%", label: "Vendas no dia" },
      { val: "12",    label: "PDVs ativos" },
    ],
    quote: "A ação da .Zero transformou um sábado comum em recorde de vendas do chocolate no ponto.",
    author: "Gerente de Trade — Nugali",
  },
  {
    id: "02",
    brand: "Hemmer",
    tag: "Promotoria",
    local: "Condor — Região Sul",
    bg: "./promotor.jpg",
    stats: [
      { val: "3.200", label: "Amostras entregues" },
      { val: "89%",   label: "Intenção de compra" },
    ],
    quote: "Profissionalismo impecável. Cada promotor sabia exatamente o que falar sobre o produto.",
    author: "Coordenadora de Marketing — Hemmer",
  },
  {
    id: "03",
    brand: "Ambev",
    tag: "Experiência",
    local: "Carrefour — São Paulo, SP",
    bg: "./1.jpg",
    stats: [
      { val: "+210%", label: "Giro de gôndola" },
      { val: "6 sem", label: "Duração da ação" },
    ],
    quote: "Resultado acima do esperado em todas as unidades. Renovamos o contrato imediatamente.",
    author: "Gerente de Categoria — Ambev",
  },
];

export default function Cases() {
  const titleRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const els = [titleRef.current, ...cardRefs.current].filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cases">
      <div className="cases-header">
        <div>
          <p className="cases-eyebrow"></p>
          <h2 className="cases-title" ref={titleRef}>
            Cases de<br /><em>sucesso</em>
          </h2>
        </div>
        <span className="cases-counter">{CASES.length} campanhas em destaque</span>
      </div>

      <div className="cases-grid">
        {CASES.map((c, i) => {
          const [venue, location] = c.local.split("—").map((s) => s.trim());
          return (
            <div
              key={c.id}
              className="case-card"
              ref={(el) => (cardRefs.current[i] = el)}
            >
              <div className="case-card__top">
                <span className="case-card__badge-num">N.{c.id}</span>
                <span className="case-card__badge-tag">{c.tag}</span>
                {venue && <span className="case-card__badge-tag">{venue}</span>}
              </div>

              <div className="case-card__hero">
                <div
                  className="case-card__icon"
                  style={{ backgroundImage: `url(${c.bg})` }}
                />
                <span className="case-card__wordmark">{c.brand}</span>
              </div>

              <div className="case-card__info">
                <p className="case-card__info-name">{c.brand}</p>
                <p className="case-card__info-sub">{location || c.local}</p>
              </div>

              <div className="case-card__footer">
                <span className="case-card__footer-label">Ver case</span>
                <span className="case-card__footer-btn">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cases-footer">
        <span className="cases-footer-note">Dados referentes a campanhas realizadas em 2026–2026</span>
        <a href="#contato" className="cases-cta">
          Quero resultados assim
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
            <path d="M1 6h14M9 1l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}