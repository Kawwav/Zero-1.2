import { useEffect, useRef, useState, useCallback } from "react";
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

// Abaixo desta largura, a animação de scroll "travado" é desligada
// (mesmo breakpoint usado em Cases.css) para não cortar o conteúdo
// empilhado, que fica mais alto que 100vh no mobile.
const MOBILE_BREAKPOINT = 780;

// Sensibilidade do wheel/touch: quanto cada pixel de delta move o
// "alvo" do progresso (0 → 1). A posição atual persegue esse alvo
// suavemente (ver EASE), não pula direto pra ele.
// Valores mais baixos = precisa rolar mais pra completar a animação
// (mais devagar).
const WHEEL_SENSITIVITY = 0.0008;
const TOUCH_SENSITIVITY = 0.0014;

// Fator de suavização do lerp por frame (0-1). Quanto MENOR, mais a
// animação "atrasa" atrás do alvo — dá aquele efeito de delay/inércia.
const EASE = 0.07;

// Cada card leva essa fração do progresso total (0-1) pra animar por
// completo, e o próximo só começa depois de STAGGER_GAP de progresso —
// como STAGGER_GAP < CARD_WINDOW, eles ficam se sobrepondo um pouco,
// criando aquele efeito de "atrasado", em cascata, ao invés de todos
// se moverem sincronizados.
const CARD_WINDOW = 0.62;
const STAGGER_GAP = 0.19;

export default function Cases() {
  const titleRef = useRef(null);
  const wrapperRef = useRef(null);
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const radiusRef = useRef(600);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );

  // Progresso da animação circular (0 = cards escondidos, 1 = no lugar)
  const progressRef = useRef(0);
  // "Alvo" pra onde o progresso está indo — o valor real (progressRef)
  // persegue esse alvo suavemente, frame a frame (efeito de inércia).
  const targetProgressRef = useRef(0);
  const rafIdRef = useRef(null);
  // true enquanto o scroll da página está "travado" pela seção
  const lockedRef = useRef(false);
  // posição Y do dedo no touch, para calcular delta manualmente
  const touchYRef = useRef(0);

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

  // Aplica o progresso (0 → 1) da animação circular nos cards
  const applyProgress = useCallback((progress) => {
    const R = radiusRef.current;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      // janela de progresso reservada para este card, com atraso em
      // cascata em relação ao anterior (ver CARD_WINDOW / STAGGER_GAP)
      let local = (progress - i * STAGGER_GAP) / CARD_WINDOW;
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
  }, []);

  // Trava/destrava o scroll da página (usado enquanto os cards animam)
  const lockScroll = () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    if (!lockedRef.current) return;
    lockedRef.current = false;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };

  // Quando a seção "cases" chega ao topo da viewport, o scroll da
  // página trava. Os cards então sobem/animam conforme o usuário
  // continua rolando (wheel/touch), sem que a página em si role.
  // Quando os 3 cards terminam de entrar (ou voltam a esconder, se o
  // usuário rolar pra cima), o scroll da página é destravado de novo.
  useEffect(() => {
    if (isMobile) {
      // No mobile a seção não trava o scroll: os cards aparecem
      // normais, empilhados, sem transform/opacity controlados por JS.
      cardRefs.current.forEach((card) => {
        if (!card) return;
        card.style.transform = "";
        card.style.opacity = "";
      });
      unlockScroll();
      return;
    }

    const computeRadius = () => {
      radiusRef.current = Math.min(window.innerWidth * 0.55, 620);
    };
    computeRadius();
    applyProgress(progressRef.current);

    // Loop de interpolação: a cada frame, a posição atual (progressRef)
    // persegue o alvo (targetProgressRef) com suavização (EASE). É o que
    // faz a animação fluir mesmo quando o wheel chega em pulos grandes
    // (mouse com "notches") ou pequenos (trackpad).
    const tick = () => {
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.001) {
        progressRef.current = target;
        applyProgress(progressRef.current);
        rafIdRef.current = null;
        if (progressRef.current >= 1 || progressRef.current <= 0) {
          unlockScroll();
        }
        return; // para o loop; só reinicia no próximo input
      }

      progressRef.current = current + diff * EASE;
      applyProgress(progressRef.current);
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const ensureLoopRunning = () => {
      if (rafIdRef.current == null) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    const moveTarget = (delta) => {
      targetProgressRef.current = Math.min(
        1,
        Math.max(0, targetProgressRef.current + delta)
      );
      ensureLoopRunning();
    };

    // Alinha a seção exatamente no topo da viewport (corrige qualquer
    // "overshoot" do scroll nativo) e só então trava.
    const snapAndLock = () => {
      const section = sectionRef.current;
      if (!section) return;
      const offset = section.getBoundingClientRect().top;
      if (Math.abs(offset) > 0.5) {
        window.scrollBy(0, offset);
      }
      targetProgressRef.current = progressRef.current;
      lockScroll();
    };

    // Detecta, pelo evento de scroll nativo (que reflete a posição já
    // aplicada pelo navegador), o momento em que a seção se aproxima do
    // topo da tela — tanto vindo de cima (rolando pra baixo, entrando
    // pela primeira vez) quanto vindo de baixo (rolando pra cima, de
    // volta pra reverter a animação).
    const handleScroll = () => {
      if (lockedRef.current) return;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      const nearTop = rect.top > -vh * 0.9 && rect.top < vh * 0.9;
      if (!nearTop) return;

      if (rect.top <= 0 && progressRef.current < 1) {
        snapAndLock();
      } else if (rect.top > 0 && progressRef.current > 0) {
        snapAndLock();
      }
    };

    const handleWheel = (e) => {
      if (!lockedRef.current) return; // deixa o scroll nativo normal (a entrada é detectada pelo listener de scroll acima)
      e.preventDefault();
      moveTarget(e.deltaY * WHEEL_SENSITIVITY);
    };

    const handleTouchStart = (e) => {
      touchYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = touchYRef.current - currentY; // >0 = dedo sobe = scroll pra baixo
      touchYRef.current = currentY;

      if (!lockedRef.current) return; // deixa o touch nativo normal
      e.preventDefault();
      moveTarget(deltaY * TOUCH_SENSITIVITY);
    };

    const handleResize = () => {
      computeRadius();
      applyProgress(progressRef.current);
    };

    handleScroll(); // caso a página já carregue com a seção próxima do topo
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("resize", handleResize);
    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      unlockScroll();
    };
  }, [isMobile, applyProgress]);

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
    <div className="cases-scroll-wrapper" ref={wrapperRef}>
    <section className="cases" ref={sectionRef}>
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