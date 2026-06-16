import { useState, useEffect, useRef, useCallback } from "react";
import "./sobre.css";

const BRANDS = [
  { src: "ambev.webp",     alt: "Ambev" },
  { src: "harts.webp",     alt: "Hart's" },
  { src: "heinz.webp",     alt: "Heinz" },
  { src: "hemmer.webp",    alt: "Hemmer" },
  { src: "nova.webp",      alt: "Nova" },
  { src: "nugali.webp",    alt: "Nugali" },
  { src: "paviloche.webp", alt: "Paviloche" },
  { src: "quero.webp",     alt: "Quero" },
  { src: "schluck.webp",   alt: "Schluck" },
];

const BRANDS_LOOP = [...BRANDS, ...BRANDS];

const STATE_COORDS = {
  AC: { x: 32.3, y: 33.3 },
  AM: { x: 36.5, y: 26.9 },
  RR: { x: 41.1, y: 12.0 },
  AP: { x: 51.3, y: 15.3 },
  PA: { x: 52.0, y: 26.9 },
  RO: { x: 36.5, y: 37.0 },
  MT: { x: 43.2, y: 38.9 },
  TO: { x: 52.6, y: 37.0 },
  MA: { x: 54.7, y: 26.9 },
  PI: { x: 57.3, y: 29.6 },
  CE: { x: 60.9, y: 27.8 },
  RN: { x: 64.0, y: 26.9 },
  PB: { x: 64.6, y: 28.7 },
  PE: { x: 63.5, y: 30.6 },
  AL: { x: 64.0, y: 32.4 },
  SE: { x: 63.5, y: 34.3 },
  BA: { x: 57.3, y: 40.7 },
  GO: { x: 49.5, y: 43.5 },
  DF: { x: 52.0, y: 42.6 },
  MS: { x: 45.3, y: 50.0 },
  MG: { x: 54.2, y: 48.1 },
  ES: { x: 58.9, y: 48.1 },
  RJ: { x: 56.8, y: 51.9 },
  SP: { x: 52.0, y: 53.7 },
  PR: { x: 50.5, y: 59.3 },
  SC: { x: 51.0, y: 63.9 },
  RS: { x: 49.0, y: 69.4 },
};

const STATE_NAMES = {
  AC: "Acre", AM: "Amazonas", RR: "Roraima", AP: "Amapá", PA: "Pará",
  RO: "Rondônia", MT: "Mato Grosso", TO: "Tocantins", MA: "Maranhão",
  PI: "Piauí", CE: "Ceará", RN: "Rio Grande do Norte", PB: "Paraíba",
  PE: "Pernambuco", AL: "Alagoas", SE: "Sergipe", BA: "Bahia",
  GO: "Goiás", DF: "Distrito Federal", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", ES: "Espírito Santo", RJ: "Rio de Janeiro",
  SP: "São Paulo", PR: "Paraná", SC: "Santa Catarina", RS: "Rio Grande do Sul",
};


const NATIONWIDE = ["Carrefour", "Assaí Atacadista", "Sam's Club"];
const ALL_STATES = Object.keys(STATE_COORDS);


const NETWORKS = [
  {
    name: "Festval",
    states: {
      PR: ["Curitiba", "São José dos Pinhais", "Pinhais", "Região metropolitana de Curitiba"],
    },
  },
  {
    name: "Condor",
    states: {
      PR: ["Curitiba", "Londrina", "Maringá", "Cascavel"],
      SC: ["Joinville e região"],
    },
  },
  {
    name: "Jacomar",
    states: {
      PR: ["Curitiba", "São José dos Pinhais", "Piraquara", "Fazenda Rio Grande", "Região metropolitana"],
    },
  },
  {
    name: "Rio Verde",
    states: {
      PR: ["Curitiba", "Araucária", "Fazenda Rio Grande", "Campo Largo", "Região metropolitana"],
    },
  },
  {
    name: "Fort Atacadista",
    states: {
      SC: ["Diversas cidades"],
      PR: ["Algumas cidades"],
      RS: ["Diversas cidades"],
      SP: ["Diversas cidades"],
      GO: ["Diversas cidades"],
      MT: ["Diversas cidades"],
      MS: ["Diversas cidades"],
      DF: ["Brasília"],
    },
  },
  {
    name: "Koch",
    states: {
      SC: ["Mais de 26 cidades do estado"],
    },
  },
  {
    name: "Komprão",
    states: {
      SC: ["Diversas cidades do estado"],
    },
  },
  {
    name: "Cooper",
    states: {
      SC: ["Blumenau", "Indaial", "Timbó", "Rodeio", "Ibirama", "Jaraguá do Sul", "Joinville"],
    },
  },
  {
    name: "Brasil Atacadista",
    states: {
      SC: ["Florianópolis", "São José", "Palhoça", "Joinville", "Blumenau", "Criciúma"],
    },
  },
  {
    name: "Hipermais",
    states: {
      SC: ["Joinville", "Região norte do estado"],
    },
  },
  {
    name: "Giassi",
    states: {
      SC: ["Florianópolis", "Tubarão", "Criciúma", "Içara", "Araranguá", "Joinville"],
    },
  },
];


function buildStateData() {
  const data = {};

  ALL_STATES.forEach((uf) => {
    data[uf] = [];
  });

  NETWORKS.forEach((net) => {
    Object.entries(net.states).forEach(([uf, cities]) => {
      if (!data[uf]) data[uf] = [];
      data[uf].push({ rede: net.name, cidades: cities });
    });
  });

  ALL_STATES.forEach((uf) => {
    NATIONWIDE.forEach((rede) => {
      data[uf].push({ rede, cidades: ["Presente em todo o estado"] });
    });
  });

  return data;
}

const STATE_DATA = buildStateData();
const ALL_NETWORKS = [...NETWORKS.map((n) => n.name), ...NATIONWIDE];


/* ── Hook: progresso de scroll de um elemento ── */
function useScrollStat() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const container = el.closest(".sobre-panel-content");
    const winH = container ? container.clientHeight : window.innerHeight;
    const rect = el.getBoundingClientRect();
    const containerRect = container ? container.getBoundingClientRect() : { top: 0 };
    const relTop = rect.top - containerRect.top;
    const start = winH * 0.92;
    const end   = winH * 0.28;
    const raw   = (start - relTop) / (start - end);
    setProgress(Math.min(Math.max(raw, 0), 1));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const container = el.closest(".sobre-panel-content") || window;
    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      container.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return [ref, progress];
}

/* ── Linha de stat animada ── */
function StatRow({ label, valorFinal, sufixo = "", formatMil = false }) {
  const [ref, progress] = useScrollStat();
  const count     = Math.floor(progress * valorFinal);
  const pct       = progress * 100;
  const formatted = formatMil ? count.toLocaleString("pt-BR") : String(count);
  const display   = sufixo === "+" ? `${formatted}+` : `${formatted}${sufixo}`;

  return (
    <div className="sobre-stat-row" ref={ref}>
      <span className="sobre-stat-label">{label}</span>
      <div className="sobre-stat-track">
        <div className="sobre-stat-fill" style={{ width: `${pct}%` }} />
        <div className="sobre-stat-dot"  style={{ left:  `${pct}%` }} />
      </div>
      <div className="sobre-stat-valor">{display}</div>
    </div>
  );
}

/* ── Hook: animação bidirecional — entra e sai do viewport ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.12, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

export default function SobrePanel({ onClose }) {
  const [closing, setClosing] = useState(false);

  const [innerRef,        innerVisible]        = useInView();
  const [brandsRef,       brandsVisible]       = useInView();
  const [mapRef,          mapVisible]          = useInView();
  const [statsRef,        statsVisible]        = useInView();
  const [diferenciais0,   diferenciais0Vis]    = useInView({ threshold: 0.1 });
  const [diferenciais1,   diferenciais1Vis]    = useInView({ threshold: 0.1 });
  const [diferenciais2,   diferenciais2Vis]    = useInView({ threshold: 0.1 });

  const [activeNetwork, setActiveNetwork] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, uf: null, x: 0, y: 0 });
  const mapWrapRef = useRef(null);

  const activeStates = activeNetwork
    ? new Set(
        ALL_STATES.filter((uf) =>
          STATE_DATA[uf].some((entry) => entry.rede === activeNetwork)
        )
      )
    : new Set(ALL_STATES);

  const handleDotEnter = (uf, e) => {
    if (!activeStates.has(uf)) return;
    const rect = mapWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dotRect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      uf,
      x: dotRect.left - rect.left + dotRect.width / 2,
      y: dotRect.top - rect.top,
    });
  };

  const handleDotLeave = () => setTooltip((t) => ({ ...t, visible: false }));

  const toggleNetwork = (name) =>
    setActiveNetwork((prev) => (prev === name ? null : name));

  const tooltipEntries =
    tooltip.uf &&
    (activeNetwork
      ? STATE_DATA[tooltip.uf].filter((e) => e.rede === activeNetwork)
      : STATE_DATA[tooltip.uf]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(), 1100);
  };

  return (
    <div className="sobre-panel">
      <div className={`sobre-panel-curtain${closing ? " closing" : ""}`} />

      <div className={`sobre-panel-content${closing ? " closing" : ""}`}>
        <header className="sobre-panel-header">
          <img src="Logoescura.png" alt=".Zero" className="sobre-panel-logo" />
          <button className="sobre-panel-voltar" onClick={handleClose} aria-label="Voltar">
            <span className="sobre-panel-voltar-arrow">←</span> VOLTAR
          </button>
        </header>

        {/* ── Texto principal ── */}
        <div
          ref={innerRef}
          className={`sobre-panel-inner sobre-reveal${innerVisible ? " sobre-reveal--visible" : ""}`}
        >
          <p className="sobre-panel-label">Sobre Nós</p>
          <h2 className="sobre-panel-title">
            Transformamos<br />provas em vendas.
          </h2>
          <p className="sobre-panel-body">
            A .Zero nasceu da crença de que o momento da degustação é o mais
            poderoso dentro do varejo. Somos especialistas em conectar marcas ao
            público certo, no lugar certo e na hora certa.
          </p>
        </div>

        {/* ── Seção: Marcas (carrossel) ── */}
        <section
          ref={brandsRef}
          className={`sobre-brands-section sobre-reveal${brandsVisible ? " sobre-reveal--visible" : ""}`}
        >
          <div className="sobre-brands-sticky">

            <div className="sobre-brands-left">
              <p className="sobre-brands-eyebrow">Clientes</p>
              <h3 className="sobre-brands-title">
                Marcas que<br /><em>trabalhamos</em>
              </h3>
              <div className="sobre-brands-counter">
                <span className="sobre-brands-counter-line" />
                <span>{BRANDS.length} marcas parceiras</span>
              </div>
            </div>

            <div className="sobre-brands-right">
              <div className="sobre-brands-track">
                {BRANDS_LOOP.map((b, i) => (
                  <div className="sobre-brand-item" key={i} aria-hidden={i >= BRANDS.length}>
                    <img src={b.src} alt={i < BRANDS.length ? b.alt : ""} />
                    {i < BRANDS.length && (
                      <span className="sobre-brand-item-name">{b.alt}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="sobre-brands-blur sobre-brands-blur--left" />
              <div className="sobre-brands-blur sobre-brands-blur--right" />
            </div>

          </div>
        </section>

        {/* ── Seção: Mapa de Mercados ── */}
        <section
          ref={mapRef}
          className={`sobre-brands-section sobre-markets-section sobre-reveal${mapVisible ? " sobre-reveal--visible" : ""}`}
        >
          <div className="bmap-section">

            <div className="bmap-left">
              <p className="sobre-brands-eyebrow">Onde atuamos</p>
              <h3 className="sobre-brands-title">
                Mercados<br /><em>parceiros</em>
              </h3>
              <div className="sobre-brands-counter">
                <span className="sobre-brands-counter-line" />
                <span>{ALL_NETWORKS.length} redes parceiras</span>
              </div>

              <div className="bmap-tags">
                {ALL_NETWORKS.map((name) => (
                  <button
                    key={name}
                    className={`bmap-tag${activeNetwork === name ? " bmap-tag--active" : ""}`}
                    onClick={() => toggleNetwork(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bmap-right" ref={mapWrapRef}>
              <img
                src="mapa.png"
                alt="Mapa do Brasil com presença das redes parceiras"
                className="bmap-img"
                draggable={false}
              />

              {ALL_STATES.map((uf) => {
                const pos = STATE_COORDS[uf];
                const active = activeStates.has(uf);
                return (
                  <span
                    key={uf}
                    className={`bmap-dot${active ? " bmap-dot--active" : " bmap-dot--dim"}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onMouseEnter={(e) => handleDotEnter(uf, e)}
                    onMouseLeave={handleDotLeave}
                    aria-label={STATE_NAMES[uf]}
                  />
                );
              })}

              {tooltip.visible && tooltipEntries && (
                <div
                  className="bmap-tooltip bmap-tooltip--visible"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  <div className="bmap-tooltip-title">{STATE_NAMES[tooltip.uf]}</div>
                  {tooltipEntries.map((entry, i) => (
                    <div className="bmap-tooltip-entry" key={i}>
                      <span className="bmap-tooltip-brand">{entry.rede}</span>
                      <span className="bmap-tooltip-cities">
                        {entry.cidades.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>



        {/* ── Seção: Stats ── */}
        <section
          ref={statsRef}
          className={`sobre-stats-section sobre-reveal${statsVisible ? " sobre-reveal--visible" : ""}`}
        >
          <p className="sobre-stats-eyebrow">Nossos números</p>
          <div className="sobre-stats-list">
            <StatRow label="Clientes Atendidos" valorFinal={120} sufixo="+" />
            <StatRow label="Ações Realizadas"   valorFinal={850} sufixo="+" formatMil />
            <StatRow label="Taxa de Satisfação"  valorFinal={100} sufixo="%" />
          </div>
        </section>


        {/* ── Seção: Diferenciais ── */}
        <section className="sobre-diferenciais-section">
          <div className="sobre-diferenciais-grid">
            <div
              ref={diferenciais0}
              className={`sobre-diferencial-card sobre-reveal sobre-reveal--slide-left${diferenciais0Vis ? " sobre-reveal--visible" : ""}`}
            >
              <span className="sobre-diferencial-num">01</span>
              <h3 className="sobre-diferencial-titulo">Degustação<br />Estratégica</h3>
              <p className="sobre-diferencial-desc">
                Planejamos cada ação com base no perfil do produto, do ponto de
                venda e do público-alvo — nada é improvisado.
              </p>
            </div>
            <div
              ref={diferenciais1}
              className={`sobre-diferencial-card sobre-reveal${diferenciais1Vis ? " sobre-reveal--visible" : ""}`}
            >
              <span className="sobre-diferencial-num">02</span>
              <h3 className="sobre-diferencial-titulo">Time<br />Treinado</h3>
              <p className="sobre-diferencial-desc">
                Nossos promotores são capacitados para criar conexões reais:
                contam a história do produto e geram desejo genuíno.
              </p>
            </div>
            <div
              ref={diferenciais2}
              className={`sobre-diferencial-card sobre-reveal sobre-reveal--slide-right${diferenciais2Vis ? " sobre-reveal--visible" : ""}`}
            >
              <span className="sobre-diferencial-num">03</span>
              <h3 className="sobre-diferencial-titulo">Execução<br />Completa</h3>
              <p className="sobre-diferencial-desc">
                Do planejamento ao relatório final, cuidamos de cada detalhe para
                que sua marca brilhe no ponto de venda.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}