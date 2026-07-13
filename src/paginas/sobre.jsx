import { useState, useEffect, useRef, useCallback } from "react";
import "./sobre.css";

const BRANDS = [
  { src: "ambev.webp", alt: "Ambev" },
  { src: "harts.webp", alt: "Hart's" },
  { src: "heinz.webp", alt: "Heinz" },
  { src: "hemmer.webp", alt: "Hemmer" },
  { src: "nova.webp", alt: "Nova" },
  { src: "nugali.webp", alt: "Nugali" },
  { src: "paviloche.webp", alt: "Paviloche" },
  { src: "quero.webp", alt: "Quero" },
  { src: "schluck.webp", alt: "Schluck" },
];

const BRANDS_LOOP = [...BRANDS, ...BRANDS];

const STATE_COORDS = {
   AC: { x: 11.8, y: 40.7 },
  AM: { x: 26.5, y: 26.9 },
  RR: { x: 32.1, y: 12.0 },
  AP: { x: 55.5, y: 15.3 },
  PA: { x: 52.0, y: 26.9 },
  RO: { x: 26.5, y: 42 },
  MT: { x: 47.2, y: 47.9 },
  TO: { x: 64.6, y: 40.0 },
  MA: { x: 72.7, y: 28.9 },
  PI: { x: 79.3, y: 34.6 },
  CE: { x: 86.9, y: 27.8 },
  RN: { x: 93.5, y: 30.5 },
  PB: { x: 95.6, y: 33.7 },
  PE: { x: 93.5, y: 37.6 },
  AL: { x: 93.8, y: 39.9 },
  SE: { x: 91.8, y: 41.9 },
  BA: { x: 80.3, y: 45.7 },
  GO: { x: 60.4, y: 53.5 },
  DF: { x: 66.2, y: 54.5 },
  MS: { x: 49.3, y: 65.0 },
  MG: { x: 75.2, y: 60.1 },
  ES: { x: 84.7, y: 63.1 },
  RJ: { x: 80.8, y: 69.9 },
  SP: { x: 63.0, y: 68.7 },
  PR: { x: 53.5, y: 75.3 },
  SC: { x: 59.0, y: 81.9 },
  RS: { x: 51.3, y: 87.4 },
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
    const container = el.closest(".painel-conteudo");
    const winH = container ? container.clientHeight : window.innerHeight;
    const rect = el.getBoundingClientRect();
    const containerRect = container ? container.getBoundingClientRect() : { top: 0 };
    const relTop = rect.top - containerRect.top;
    const start = winH * 0.92;
    const end = winH * 0.28;
    const raw = (start - relTop) / (start - end);
    setProgress(Math.min(Math.max(raw, 0), 1));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const container = el.closest(".painel-conteudo") || window;
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
  const count = Math.floor(progress * valorFinal);
  const pct = progress * 100;
  const formatted = formatMil ? count.toLocaleString("pt-BR") : String(count);
  const display = sufixo === "+" ? `${formatted}+` : `${formatted}${sufixo}`;

  return (
    <div className="numero-linha" ref={ref}>
      <span className="numero-rotulo">{label}</span>
      <div className="numero-trilha">
        <div className="numero-preenchimento" style={{ width: `${pct}%` }} />
        <div className="numero-ponto" style={{ left: `${pct}%` }} />
      </div>
      <div className="numero-valor">{display}</div>
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

  const [innerRef, innerVisible] = useInView();
  const [brandsRef, brandsVisible] = useInView();
  const [mapRef, mapVisible] = useInView();
  const [statsRef, statsVisible] = useInView();
  const [diferenciais0, diferenciais0Vis] = useInView({ threshold: 0.1 });
  const [diferenciais1, diferenciais1Vis] = useInView({ threshold: 0.1 });
  const [diferenciais2, diferenciais2Vis] = useInView({ threshold: 0.1 });

  const [activeNetwork, setActiveNetwork] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, uf: null, x: 0, y: 0 });
  const mapWrapRef = useRef(null);

  // Trava o scroll da página (html + body) enquanto o painel estiver
  // aberto — assim só existe UM scroll: o do próprio painel
  // (.painel-conteudo). Feito aqui dentro (e não em quem chama o
  // componente) pra funcionar não importa por onde o painel é aberto.
  useEffect(() => {
    const { documentElement: html, body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

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
    <div className="painel">
      <div className={`painel-cortina${closing ? " closing" : ""}`} />

      <div className={`painel-conteudo${closing ? " closing" : ""}`}>
        <header className="painel-cabecalho">
          <img src="Logoescura.png" alt=".Zero" className="painel-logo" />
          <button className="painel-voltar" onClick={handleClose} aria-label="Voltar">
            <span className="painel-voltar-seta">←</span> VOLTAR
          </button>
        </header>

        {/* ── Texto principal ── */}
        <div
          ref={innerRef}
          className={`painel-interno revelar${innerVisible ? " revelar--visivel" : ""}`}
        >
          <p className="painel-rotulo">Sobre Nós</p>
          <h2 className="painel-titulo">
            Transformamos<br />provas em vendas.
          </h2>
          <p className="painel-texto">
            A .Zero nasceu da crença de que o momento da degustação é o mais
            poderoso dentro do varejo. Somos especialistas em conectar marcas ao
            público certo, no lugar certo e na hora certa.
          </p>
        </div>

        {/* ── Seção: Marcas (carrossel) ── */}
        <section
          ref={brandsRef}
          className={`marcas-secao revelar${brandsVisible ? " revelar--visivel" : ""}`}
        >
          <div className="marcas-fixo">

            <div className="marcas-esquerda">
              <h3 className="marcas-titulo">
                Marcas que<br /><em>trabalhamos</em>
              </h3>
              <div className="marcas-contador">

              </div>
            </div>

            <div className="marcas-direita">
              <div className="marcas-trilha">
                {BRANDS_LOOP.map((b, i) => (
                  <div className="marca-item" key={i} aria-hidden={i >= BRANDS.length}>
                    <img src={b.src} alt={i < BRANDS.length ? b.alt : ""} />
                    {i < BRANDS.length && (
                      <span className="marca-item-nome">{b.alt}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="marcas-desfoque marcas-desfoque--esquerda" />
              <div className="marcas-desfoque marcas-desfoque--direita" />
            </div>

          </div>
        </section>

        {/* ── Seção: Mapa de Mercados ── */}
        <section
          ref={mapRef}
          className={`marcas-secao mercados-secao revelar${mapVisible ? " revelar--visivel" : ""}`}
        >
          <div className="mapa-secao">

            <div className="mapa-esquerda">

              <h3 className="marcas-titulo">
                Mercados<br /><em>parceiros</em>
              </h3>
              <div className="marcas-contador">
                <span className="marcas-contador-linha" />
                <span>{ALL_NETWORKS.length} redes parceiras</span>
              </div>

              <div className="mapa-tags">
                {ALL_NETWORKS.map((name) => (
                  <button
                    key={name}
                    className={`mapa-tag${activeNetwork === name ? " mapa-tag--ativo" : ""}`}
                    onClick={() => toggleNetwork(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mapa-direita" ref={mapWrapRef}>
              <img
                src="mapa.png"
                alt="Mapa do Brasil com presença das redes parceiras"
                className="mapa-imagem"
                draggable={false}
              />

              {ALL_STATES.map((uf) => {
                const pos = STATE_COORDS[uf];
                const active = activeStates.has(uf);
                return (
                  <span
                    key={uf}
                    className={`mapa-ponto${active ? " mapa-ponto--ativo" : " mapa-ponto--apagado"}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onMouseEnter={(e) => handleDotEnter(uf, e)}
                    onMouseLeave={handleDotLeave}
                    aria-label={STATE_NAMES[uf]}
                  />
                );
              })}

              {tooltip.visible && tooltipEntries && (
                <div
                  className="mapa-dica mapa-dica--visivel"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  <div className="mapa-dica-titulo">{STATE_NAMES[tooltip.uf]}</div>
                  {tooltipEntries.map((entry, i) => (
                    <div className="mapa-dica-item" key={i}>
                      <span className="mapa-dica-marca">{entry.rede}</span>
                      <span className="mapa-dica-cidades">
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
          className={`numeros-secao revelar${statsVisible ? " revelar--visivel" : ""}`}
        >
          <p className="numeros-legenda">Nossos números</p>
          <div className="numeros-lista">
            <StatRow label="Clientes Atendidos" valorFinal={120} sufixo="+" />
            <StatRow label="Ações Realizadas" valorFinal={850} sufixo="+" formatMil />
            <StatRow label="Taxa de Satisfação" valorFinal={100} sufixo="%" />
          </div>
        </section>


        {/* ── Seção: Diferenciais ── */}
        <section className="diferenciais-secao">
          <div className="diferenciais-cabecalho">
            <h3 className="diferenciais-titulo-secao">
              Nossos diferenciais{" "}
              <span className="diferenciais-titulo-pontos">
                <span className="ponto"></span>
                <span className="ponto"></span>
                <span className="ponto"></span>
              </span>
            </h3>
          </div>

          <div className="diferenciais-grade">
            <div
              ref={diferenciais0}
              className={`diferencial-cartao revelar revelar--esquerda${diferenciais0Vis ? " revelar--visivel" : ""}`}
            >
              <span className="diferencial-numero">01</span>
              <span className="diferencial-linha" />
              <h3 className="diferencial-titulo">Degustação<br />Estratégica</h3>
              <p className="diferencial-texto">
                Planejamos cada ação com base no perfil do produto, do ponto de
                venda e do público-alvo — nada é improvisado.
              </p>
            </div>
            <div
              ref={diferenciais1}
              className={`diferencial-cartao revelar${diferenciais1Vis ? " revelar--visivel" : ""}`}
            >
              <span className="diferencial-numero">02</span>
              <span className="diferencial-linha" />
              <h3 className="diferencial-titulo">Time<br />Treinado</h3>
              <p className="diferencial-texto">
                Nossos promotores são capacitados para criar conexões reais:
                contam a história do produto e geram desejo genuíno.
              </p>
            </div>
            <div
              ref={diferenciais2}
              className={`diferencial-cartao revelar revelar--direita${diferenciais2Vis ? " revelar--visivel" : ""}`}
            >
              <span className="diferencial-numero">03</span>
              <span className="diferencial-linha" />
              <h3 className="diferencial-titulo">Execução<br />Completa</h3>
              <p className="diferencial-texto">
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