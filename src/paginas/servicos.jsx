import { useEffect, useRef, useState, useCallback } from "react";
import "./servicos.css";

const SERVICOS = [
  {
    id: "01",
    name: "PROMOTORES",
    image: "./1.jpg",
    desc: "Profissionais que atuam direto na prateleira: repõem produtos, organizam o espaço e garantem que sua marca esteja sempre bem exposta no ponto de venda.",
    mascot: "./boneco1.png",
    tags: ["Reposição", "Organização", "Prateleira"],
    etapas: [
      {
        n: "01",
        title: "Briefing",
        desc: "Entendemos o mix de produtos, os pontos de venda e a frequência de reposição necessária para sua marca.",

      },
      {
        n: "02",
        title: "Escala",
        desc: "Montamos a escala de visitas e treinamos o promotor no padrão de organização e exposição da marca.",

      },
      {
        n: "03",
        title: "Execução",
        desc: "O promotor repõe, organiza e ajusta a exposição dos produtos na prateleira em cada visita.",
      },
      {
        n: "04",
        title: "Relatório",
        desc: "Fotos de antes e depois e checklist de reposição por loja, para acompanhar a execução.",

      },
    ],
  },
  {
    id: "02",
    name: "DEGUSTAÇÃO",
    image: "./promotor.jpg",
    desc: "Equipes posicionadas nos mercados para apresentar o produto ao consumidor, oferecendo amostras e incentivando a experimentação no momento da compra.",
    mascot: "./boneco2.png",
    tags: ["Amostragem", "Experimentação", "PDV"],
    etapas: [
      {
        n: "01",
        title: "Briefing",
        desc: "Definimos o produto, o público e os pontos de venda ideais para a ação de degustação.",
      },
      {
        n: "02",
        title: "Planejamento",
        desc: "Preparamos o roteiro de abordagem, os materiais de apoio e o treinamento da equipe.",
      },
      {
        n: "03",
        title: "Execução",
        desc: "A equipe oferece amostras e conversa com o shopper no exato momento da decisão de compra.",
      },
      {
        n: "04",
        title: "Relatório",
        desc: "Volume degustado, feedback do público e impacto percebido nas vendas do dia.",
      },
    ],
  },
  {
    id: "03",
    name: "TAXA",
    image: "./1.jpg",
    desc: "Profissional contratado para realizar a taxa de serviço dentro do mercado, garantindo a execução pontual das atividades acordadas com o estabelecimento.",
    mascot: "./boneco.png",
    tags: ["Taxa de Serviço", "Execução", "PDV"],
    etapas: [
      {
        n: "01",
        title: "Briefing",
        desc: "Alinhamos com o mercado qual atividade será executada e a frequência da taxa contratada.",
      },
      {
        n: "02",
        title: "Agendamento",
        desc: "Definimos data e horário da visita conforme o combinado com o estabelecimento.",
      },
      {
        n: "03",
        title: "Execução",
        desc: "O profissional comparece ao mercado e realiza a atividade contratada dentro do prazo acordado.",
      },
      {
        n: "04",
        title: "Comprovação",
        desc: "Envio de foto e assinatura no local, comprovando a execução para validar a taxa.",
      },
    ],
  },
];

export default function Servicos() {
  const titleRef   = useRef(null);
  const itemRefs   = useRef([]);
  const sectionRef = useRef(null);
  const cursorImgRef = useRef(null);

  const [activeImg, setActiveImg]   = useState(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const [modal, setModal]           = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const rafRef                      = useRef(null);

  // posição alvo (mouse real) e posição atual (suavizada com delay)
  const targetPos  = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const items = [titleRef.current, ...itemRefs.current].filter(Boolean);
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

  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseEnter = useCallback((image) => {
    setActiveImg(image);
    setHoverVisible(true);
  }, []);

  useEffect(() => {
    const EASE = 0.09; // delay no mouse

    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * EASE;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * EASE;

      if (cursorImgRef.current) {
        cursorImgRef.current.style.setProperty("--cx", `${currentPos.current.x}px`);
        cursorImgRef.current.style.setProperty("--cy", `${currentPos.current.y}px`);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverVisible(false);
  }, []);

  const openModal = useCallback((servico) => {
    setModal(servico);
    setModalClosing(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalClosing(true);
    setTimeout(() => {
      setModal(null);
      setModalClosing(false);
      document.body.style.overflow = "";
    }, 600);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  return (
    <>
      <section
        className="servicos"
        ref={sectionRef}
        onMouseMove={handleMouseMove}
      >
        <h2 className="servicos1" ref={titleRef}>
          Serviços
        </h2>

        <ul className="servicos-list">
          {SERVICOS.map((servico, i) => (
            <li
              key={servico.id}
              className="servicos-item"
              ref={(el) => (itemRefs.current[i] = el)}
              onMouseEnter={() => handleMouseEnter(servico.image)}
              onMouseLeave={handleMouseLeave}
              onClick={() => openModal(servico)}
            >
              <span className="servicos-item-name">{servico.name}</span>
              <span className="servicos-item-number">{servico.id}</span>
            </li>
          ))}
        </ul>

        <div
          ref={cursorImgRef}
          className={`servicos-cursor-img${hoverVisible ? " active" : ""}`}
          style={{ "--cx": "0px", "--cy": "0px" }}
          aria-hidden="true"
        >
          {activeImg && (
            <img src={activeImg} alt="" className="servicos-cursor-img__inner" />
          )}
        </div>
      </section>

      {modal && (
        <div
          className={`svc-modal-backdrop${modalClosing ? " closing" : ""}`}
          onClick={closeModal}
        >
          <div className={`svc-modal-wrap${modalClosing ? " closing" : ""}`}>
            <img
              src={modal.mascot}
              alt=""
              className="svc-modal-mascot"
              aria-hidden="true"
            />

            <div
              className="svc-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="svc-modal-close" onClick={closeModal} aria-label="Fechar">
                <span />
                <span />
              </button>

              <div className="svc-modal-inner">
                

                <div className="svc-modal-hero">
                  <span className="svc-modal-eyebrow">Serviço</span>
                  <h3 className="svc-modal-name">{modal.name}</h3>
                  <p className="svc-modal-desc">{modal.desc}</p>
                </div>

                <div className="svc-modal-divider" />

                <div className="svc-modal-steps">
                  {modal.etapas?.map((etapa) => (
                    <div className="svc-modal-step" key={etapa.n}>
                      <span className="svc-modal-step-n">{etapa.n}</span>
                      <h4 className="svc-modal-step-title">{etapa.title}</h4>
                      <p className="svc-modal-step-desc">{etapa.desc}</p>
                      <span className="svc-modal-step-time">{etapa.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}