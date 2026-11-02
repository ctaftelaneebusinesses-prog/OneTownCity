"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type TownContextType = {
  town: string;
  setTown: (town: string) => void;
  lang: "en" | "te";
  setLang: (lang: "en" | "te") => void;
  toggleLang: () => void;
};

const TownContext = createContext<TownContextType>({
  town: "Nellore",
  setTown: () => {},
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
});

export function TownProvider({ children }: { children: React.ReactNode }) {
  const [town, setTownState] = useState<string>("Nellore");
  const [lang, setLangState] = useState<"en" | "te">("en");

  useEffect(() => {
    const savedTown = localStorage.getItem("otc_active_town");
    if (savedTown && (savedTown === "Nellore" || savedTown === "Kuppam")) {
      setTownState(savedTown);
    }
    const savedLang = localStorage.getItem("otc_active_lang");
    if (savedLang && (savedLang === "en" || savedLang === "te")) {
      setLangState(savedLang);
    }
  }, []);

  const setTown = (newTown: string) => {
    setTownState(newTown);
    localStorage.setItem("otc_active_town", newTown);
  };

  const setLang = (newLang: "en" | "te") => {
    setLangState(newLang);
    localStorage.setItem("otc_active_lang", newLang);
  };

  const toggleLang = () => {
    const next = lang === "en" ? "te" : "en";
    setLang(next);
  };

  return (
    <TownContext.Provider value={{ town, setTown, lang, setLang, toggleLang }}>
      {children}
    </TownContext.Provider>
  );
}

export function useTown() {
  return useContext(TownContext);
}
