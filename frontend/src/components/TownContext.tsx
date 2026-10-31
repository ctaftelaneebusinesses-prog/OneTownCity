"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type TownContextType = {
  town: string;
  setTown: (town: string) => void;
};

const TownContext = createContext<TownContextType>({
  town: "Nellore",
  setTown: () => {},
});

export function TownProvider({ children }: { children: React.ReactNode }) {
  const [town, setTownState] = useState<string>("Nellore");

  useEffect(() => {
    const saved = localStorage.getItem("otc_active_town");
    if (saved && (saved === "Nellore" || saved === "Kuppam")) {
      setTownState(saved);
    }
  }, []);

  const setTown = (newTown: string) => {
    setTownState(newTown);
    localStorage.setItem("otc_active_town", newTown);
  };

  return (
    <TownContext.Provider value={{ town, setTown }}>
      {children}
    </TownContext.Provider>
  );
}

export function useTown() {
  return useContext(TownContext);
}
