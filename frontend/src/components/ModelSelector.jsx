import { useEffect, useState } from 'react';

export default function ModelSelector() {
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://openrouter.ai/api/v1/models')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch model list');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data.data)) {
          setModels(data.data);
        } else {
          throw new Error("Invalid format");
        }
      })
      .catch(err => {
        console.error(err);
        setError("Couldn't load models");
      });
  }, []);

  const filteredModels = models.filter((model) =>
    model.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white shadow rounded mb-4 w-full max-w-2xl">
      <h2 className="text-lg font-semibold mb-2">🔎 Model Selector</h2>
      {error && <p className="text-red-600">{error}</p>}
  
      <input
        type="text"
        className="w-full border p-2 rounded mb-3 text-sm"
        placeholder="Search models (e.g. llama, gpt, mistral)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
  
      {searchTerm && filteredModels.length > 0 && (
        <ul className="max-h-64 overflow-y-auto text-sm space-y-1 border rounded">
          {filteredModels.map((model) => (
            <li
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setSearchTerm(''); // clear search on select
              }}
              className={`cursor-pointer p-2 hover:bg-blue-100 ${
                selectedModel === model.id ? 'bg-blue-200 font-semibold' : ''
              }`}
            >
              {model.id}
            </li>
          ))}
        </ul>
      )}
  
      {searchTerm && filteredModels.length === 0 && (
        <p className="text-sm text-gray-500">No matching models found.</p>
      )}
  
      {selectedModel && (
        <div className="mt-4 text-sm">
          ✅ <strong>Selected Model:</strong> <code>{selectedModel}</code>
        </div>
      )}
    </div>
  );
}
