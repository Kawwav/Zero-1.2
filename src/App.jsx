import { useState, useRef, useCallback } from "react";
import Header from './paginas/Header';
import About from './paginas/about';
import Servicos from './paginas/servicos';
import Cases from './paginas/Cases';
import ComoFunciona from './paginas/Como';
import SobreNos from './paginas/sobre';
import Footer from './assets/footer';
import "./App.css";

//git add .
//git commit -m "..."
//git push origin main

//npm run deploy

export default function App() {
  const [view, setView] = useState("home");       
  const [panelState, setPanelState] = useState("idle");
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const goToSobre = useCallback(() => {
    clearTimer();
    setPanelState("covering");

    timerRef.current = setTimeout(() => {
      setView("sobre");
      setPanelState("covered");

      // Pequeno frame para garantir render antes de revelar
      timerRef.current = setTimeout(() => {
        setPanelState("revealing");

        // Revelação completa → idle
        timerRef.current = setTimeout(() => {
          setPanelState("idle");
        }, 700);
      }, 60);
    }, 650);
  }, []);

  // Clicou em "Voltar" → voltar para Home
  const goBack = useCallback(() => {
    clearTimer();
    setPanelState("back-covering");

    timerRef.current = setTimeout(() => {
      setView("home");
      setPanelState("back-covered");

      timerRef.current = setTimeout(() => {
        setPanelState("back-revealing");

        timerRef.current = setTimeout(() => {
          setPanelState("idle");
        }, 700);
      }, 60);
    }, 650);
  }, []);


  const panelClass = () => {
    if (panelState === "covering" || panelState === "back-covering") return "panel-up";
    if (panelState === "covered"  || panelState === "back-covered")  return "panel-full";
    if (panelState === "revealing" || panelState === "back-revealing") return "panel-down";
    return "panel-hidden";
  };

  return (
    <>
      {view === "home" ? (
        <>
          <Header />
          <About onNavigateToSobre={goToSobre} />
          <Servicos />
          <Cases />
          <ComoFunciona />
          <Footer />
        </>
      ) : (
        <SobreNos onClose={goBack} />
      )}

      {/* Painel de transição verde */}
      <div className={`transition-panel ${panelClass()}`} aria-hidden="true" />
    </>
  );
}