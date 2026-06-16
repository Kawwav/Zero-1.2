import { useEffect, useRef } from "react";
import "./Como.css";

const STEPS = [
  {
    id: "01",
    name: "Briefing",
    desc: "Entendemos sua marca, seu produto e seus objetivos. Definimos o público-alvo, os pontos de venda estratégicos e as metas de conversão para a campanha.",
    tag: "1 a 3 dias",
  },
  {
    id: "02",
    name: "Planejamento",
    desc: "Montamos o calendário de ações, selecionamos e treinamos a equipe de promotores. Cada detalhe — do script ao material de apoio — é preparado com antecedência.",
    tag: "3 a 7 dias",
  },
  {
    id: "03",
    name: "Execução",
    desc: "Nossa equipe atua nos PDVs com presença, técnica e energia. Monitoramos cada ação em tempo real e ajustamos a abordagem conforme o comportamento do shopper.",
    tag: "Conforme contrato",
  },
  {
    id: "04",
    name: "Relatório",
    desc: "Entregamos um relatório completo com fotos, dados de vendas, feedback do shopper e análise de desempenho. Tudo documentado para embasar as próximas decisões.",
    tag: "Até 5 dias úteis",
  },
];

export default function ComoFunciona() {
  const titleRef = useRef(null);
  const descRef  = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const els = [titleRef.current, descRef.current, ...itemRefs.current].filter(Boolean);
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
    <section className="como">
      <div className="como-header">
        <div>
          <p className="como-eyebrow">Nosso processo</p>
          <h2 className="como-title" ref={titleRef}>
            Como<br /><em>funciona</em>
          </h2>
        </div>
        <p className="como-desc" ref={descRef}>
          Do primeiro contato à entrega dos resultados, cada etapa é pensada
          para garantir o máximo desempenho da sua marca no ponto de venda.
        </p>
      </div>

      <ul className="como-list">
        {STEPS.map((step, i) => (
          <li
            key={step.id}
            className="como-item"
            ref={(el) => (itemRefs.current[i] = el)}
          >
            <span className="como-item__num">{step.id}</span>
            <h3 className="como-item__name">{step.name}</h3>
            <div className="como-item__body">
              <p className="como-item__desc">{step.desc}</p>
              <span className="como-item__tag">
                <span className="como-item__tag-dot" />
                {step.tag}
              </span>
            </div>
            <div className="como-item__bar" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  );
}