import { useEffect, useRef, useState, useCallback } from "react";
import "./servicos.css";

const SERVICOS = [
  {
    id: "01",
    name: "PROMOTORES",
    image: "./1.jpg",
    desc: "Equipes treinadas para representar sua marca com excelência no ponto de venda.",
    mascot: "./boneco1.png",
  },
  {
    id: "02",
    name: "DEGUSTAÇÃO",
    image: "./promotor.jpg",
    desc: "Equipes treinadas para representar sua marca com excelência no ponto de venda.",
    mascot: "./boneco2.png",
  },
  {
    id: "03",
    name: "TAXA",
    image: "./1.jpg",
    desc: "Equipes treinadas para representar sua marca com excelência no ponto de venda.",
    mascot: "./boneco.png",
  },
];

export default function Servicos() {
  const titleRef   = useRef(null);
  const itemRefs   = useRef([]);
  const sectionRef = useRef(null);

  const [cursor, setCursor]         = useState({ x: 0, y: 0 });
  const [activeImg, setActiveImg]   = useState(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const [modal, setModal]           = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const rafRef                      = useRef(null);

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
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    });
  }, []);

  const handleMouseEnter = useCallback((image) => {
    setActiveImg(image);
    setHoverVisible(true);
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

  useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), []);

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
          className={`servicos-cursor-img${hoverVisible ? " active" : ""}`}
          style={{ "--cx": `${cursor.x}px`, "--cy": `${cursor.y}px` }}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}