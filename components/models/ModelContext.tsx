"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type ModelContextType = {
  model: string;
  setModel: (model: string) => void;
};

const ModelContext = createContext<ModelContextType>({
  model: "Gemini 2.5 Pro",
  setModel: () => {},
});

export function ModelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [model, setModelState] = useState("Gemini 2.5 Pro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem("xtent-model") ??
      "Gemini 2.5 Pro";

    setModelState(saved);
    setMounted(true);
  }, []);

  function setModel(model: string) {
    localStorage.setItem("xtent-model", model);
    setModelState(model);
  }

  if (!mounted) return null;

  return (
    <ModelContext.Provider
      value={{ model, setModel }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}