import { useState, useEffect } from 'react';
import { useModelSettings } from '../context/ModelSettingsContext';

export default function LLMQueryApp({ projectId }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [chats, setChats] = useState({});
  const [activeChatId, setActiveChatId] = useState('chat1');
  const [loading, setLoading] = useState(false);

  const {
    model,
    temperature,
    topP,
    topK,
    frequencyPenalty,
  } = useModelSettings();

  const canAddNewChat = Object.keys(chats).length < 10;

  const handleNewChat = () => {
    const newId = `chat${Object.keys(chats).length + 1}`;
    setChats(prev => ({ ...prev, [newId]: [] }));
    setActiveChatId(newId);
  };

  // Load all chats for the current project
  useEffect(() => {
    if (!projectId) return;
    fetch(`http://localhost:8000/projects/${projectId}/chats`)
      .then(res => res.json())
      .then(data => {
        setChats(data);
        setActiveChatId(Object.keys(data)[0] || 'chat1');
      })
      .catch((err) => {
        console.error("Failed to load project chats:", err);
        setChats({ chat1: [] });
        setActiveChatId('chat1');
      });
  }, [projectId]);

  // Load individual chat history on activeChatId change
  useEffect(() => {
    fetch(`http://localhost:8000/history/${activeChatId}`)
      .then(res => res.json())
      .then(data => {
        setChats((prev) => ({
          ...prev,
          [activeChatId]: Array.isArray(data) ? data : [],
        }));
      })
      .catch(err => {
        console.error("Failed to load chat:", err);
      });
  }, [activeChatId]);

  const sendQuery = async () => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: input,
          temperature,
          top_p: topP,
          top_k: topK,
          frequency_penalty: frequencyPenalty,
          chat_id: activeChatId,
          project_id: projectId,
        }),
      });
      const data = await res.json();
      setResponse(data.response);
      setInput('');
      setChats((prevChats) => ({
        ...prevChats,
        [activeChatId]: [
          ...(prevChats[activeChatId] || []),
          { prompt: input, response: data.response },
        ],
      }));
    } catch (err) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center text-white">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(chats).map((chatId) => (
          <button
            key={chatId}
            onClick={() => setActiveChatId(chatId)}
            className={`px-4 py-2 rounded ${
              activeChatId === chatId ? 'bg-blue-600 text-white' : 'bg-gray-600'
            }`}
          >
            {chatId}
          </button>
        ))}
        <button
          disabled={!canAddNewChat}
          onClick={handleNewChat}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          + New Chat
        </button>
        <button
          onClick={() => {
            fetch(`http://localhost:8000/history/${activeChatId}`, {
              method: 'DELETE'
            }).then(() => {
              setChats((prev) => ({
                ...prev,
                [activeChatId]: [],
              }));
            });
          }}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          🧹 Clear This Chat
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">LLM Query Interface</h1>

      <div className="w-full max-w-2xl bg-[#1b263b] p-6 rounded-xl shadow space-y-4">
        <div className="space-y-4 flex flex-col">
          {Array.isArray(chats[activeChatId]) &&
            chats[activeChatId].map((entry, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                {/* User bubble */}
                {entry.prompt && (
                  <div className="flex justify-end">
                    <div
                      className="max-w-[75%] bg-yellow-100 text-black p-3 rounded-2xl rounded-br-none shadow"
                    >
                      {entry.prompt}
                    </div>
                  </div>
                )}
                {/* AI bubble */}
                {entry.response && (
                  <div className="flex justify-start">
                    <div
                      className="max-w-[75%] bg-gray-700 text-white p-3 rounded-2xl rounded-bl-none shadow"
                    >
                      {entry.response}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
    
        


        <textarea
          className="w-full border border-gray-600 rounded p-2 h-32 bg-[#0d1b2a] text-white"
          placeholder="Enter your prompt..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={sendQuery}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
