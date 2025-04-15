import { createContext, useContext, useState } from 'react';

const ModelSettingsContext = createContext();

export function ModelSettingsProvider({ children }) {
  const [model, setModel] = useState('meta-llama/llama-3.2-3b-instruct:free');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1.0);
  const [topK, setTopK] = useState(40);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);

  return (
    <ModelSettingsContext.Provider value={{
      model, setModel,
      temperature, setTemperature,
      topP, setTopP,
      topK, setTopK,
      frequencyPenalty, setFrequencyPenalty
    }}>
      {children}
    </ModelSettingsContext.Provider>
  );
}

export function useModelSettings() {
  return useContext(ModelSettingsContext);
}