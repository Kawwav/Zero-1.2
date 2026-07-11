import { useEffect, useRef, useState } from "react";
import "./Cases.css";

const CASES = [
  {
    id: "01",
    brand: "Nugali",
    tag: "Degustação",
    local: "Festval — Curitiba, PR",
    bg: "./nugali.png",
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
    bg: "./hemmer.png",
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
    bg: "./ambev.png",
    stats: [
      { val: "+210%", label: "Giro de gôndola" },
      { val: "6 sem", label: "Duração da ação" },
    ],
    quote: "Resultado acima do esperado em todas as unidades. Renovamos o contrato imediatamente.",
    author: "Gerente de Categoria — Ambev",
  },
];

// Distância de scroll (em vh) reservada para a animação de CADA card.
// Quanto maior, mais "devagar" o card percorre o caminho circular.
const SEGMENT_VH = 70;

// Abaixo desta largura, a animação de scroll "pinado" é desligada
// (mesmo breakpoint usado em Cases.css) para não cortar o conteúdo
// empilhado, que fica mais alto que 100vh no mobile.
const MOBILE_BREAKPOINT = 780;

export default function Cases() {
  const titleRef = useRef(null);
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const radiusRef = useRef(600);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );

  // Acompanha o breakpoint mobile para ligar/desligar a animação pinada
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fade-in simples do título (não faz parte do trilho de scroll dos cards)
  useEffect(() => {
    if (!titleRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("visible", entry.isIntersecting);
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  // Animação dos cards em caminho circular, presa (pinada) ao scroll
  useEffect(() => {
    if (isMobile) {
      // No mobile a seção não fica "pinada": os cards aparecem
      // normais, empilhados, sem transform/opacity controlados por JS.
      cardRefs.current.forEach((card) => {
        if (!card) return;
        card.style.transform = "";
        card.style.opacity = "";
      });
      return;
    }

    const computeRadius = () => {
      radiusRef.current = Math.min(window.innerWidth * 0.55, 620);
    };
    computeRadius();

    const N = cardRefs.current.length;
    let ticking = false;

    const applyProgress = (progress) => {
      const R = radiusRef.current;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        // fatia de progresso reservada para este card (0 → 1)
        let local = (progress - i / N) / (1 / N);
        local = Math.min(1, Math.max(0, local));

        // easing suave (ease-out)
        const eased = 1 - Math.pow(1 - local, 3);

        // ângulo de 90° (início) até 0° (posição final no grid)
        const theta = (1 - eased) * (Math.PI / 2);
        const offsetX = R * Math.sin(theta);   // vem da direita
        const offsetY = R * (1 - Math.cos(theta)); // vem de baixo
        const opacity = 0.15 + eased * 0.85;
        const scale = 0.85 + eased * 0.15;

        card.style.transform =
          `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        card.style.opacity = String(opacity);
      });
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const wrapper = wrapperRef.current;
        if (wrapper) {
          const viewportH = window.innerHeight;
          const total = wrapper.offsetHeight - viewportH;
          const rectTop = wrapper.getBoundingClientRect().top;

          let progress;
          if (total <= 0) {
            progress = 1;
          } else if (rectTop >= 0) {
            progress = 0;
          } else if (rectTop <= -total) {
            progress = 1;
          } else {
            progress = -rectTop / total;
          }
          applyProgress(progress);
        }
        ticking = false;
      });
    };

    const handleResize = () => {
      computeRadius();
      handleScroll();
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  // Arraste (mouse) para o carrossel mobile — no touch o scroll nativo
  // já funciona como "arrastar", então só tratamos ponteiro do mouse.
  const handleDragStart = (e) => {
    if (!isMobile || e.pointerType !== "mouse") return;
    const grid = gridRef.current;
    if (!grid) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: grid.scrollLeft };
    grid.classList.add("dragging");
    grid.setPointerCapture?.(e.pointerId);
  };

  const handleDragMove = (e) => {
    if (!dragRef.current.active) return;
    const grid = gridRef.current;
    if (!grid) return;
    const dx = e.clientX - dragRef.current.startX;
    grid.scrollLeft = dragRef.current.startScroll - dx;
  };

  const handleDragEnd = (e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const grid = gridRef.current;
    if (!grid) return;
    grid.classList.remove("dragging");
    try {
      grid.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="cases-scroll-wrapper"
      ref={wrapperRef}
      style={
        isMobile
          ? undefined
          : { height: `calc(100vh + ${CASES.length * SEGMENT_VH}vh)` }
      }
    >
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

      <div
        className="cases-grid"
        ref={gridRef}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerLeave={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
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
    </div>
  );
}