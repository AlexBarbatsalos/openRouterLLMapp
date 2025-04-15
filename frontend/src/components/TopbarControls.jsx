import { useState, useEffect } from 'react';
import { useModelSettings } from '../context/ModelSettingsContext';



export default function TopbarControls({ projectId }) {
  const [models, setModels] = useState([]);

  const {
    model, setModel,
    temperature, setTemperature,
    topP, setTopP,
    topK, setTopK,
    frequencyPenalty, setFrequencyPenalty
  } = useModelSettings();

  

  useEffect(() => {
    fetch('https://openrouter.ai/api/v1/models')
      .then(res => res.json())
      .then(data => setModels(data.models || []))
      .catch(err => console.error("Failed to load models:", err));
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-6 text-white text-sm">
      {/* Model Dropdown */}
      <div>
        <label className="block font-bold mb-1">Model</label>
        <select
          className="bg-[#0d1b2a] text-white border border-gray-600 p-1 rounded"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {/* Always render the default first */}
          <option value="meta-llama/llama-3.2-3b-instruct:free">
            meta-llama/llama-3.2-3b-instruct:free
          </option>

          {/* Only render additional options that are not the default */}
          {models
            .filter((m) => m.id !== 'meta-llama/llama-3.2-3b-instruct:free')
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}
              </option>
            ))}
        </select>
      </div>

      {/* Parameter Steppers */}
      <Stepper label="Temp" value={temperature} setValue={setTemperature} min={0} max={1} step={0.1} />
      <Stepper label="Top P" value={topP} setValue={setTopP} min={0} max={1} step={0.1} />
      <Stepper label="Top K" value={topK} setValue={setTopK} min={0} max={100} step={1} />
      <Stepper label="Freq" value={frequencyPenalty} setValue={setFrequencyPenalty} min={0} max={2} step={0.1} />
    </div>
  );
}

function Stepper({ label, value, setValue, min, max, step }) {
  const decrease = () => setValue(Math.max(min, parseFloat((value - step).toFixed(2))));
  const increase = () => setValue(Math.min(max, parseFloat((value + step).toFixed(2))));

  return (
    <div className="flex flex-col items-center">
      <span className="font-semibold">{label}</span>
      <div className="flex items-center gap-1 bg-[#1b263b] p-1 rounded">
        <button onClick={decrease} className="px-2 py-1 bg-[#415a77] rounded hover:bg-[#5d7290] text-white">–</button>
        <span className="px-2 w-10 text-center">{value}</span>
        <button onClick={increase} className="px-2 py-1 bg-[#415a77] rounded hover:bg-[#5d7290] text-white">+</button>
      </div>
    </div>
  );
}

