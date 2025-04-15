import { useEffect, useState } from 'react';

export default function NoteEditor({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetch(`http://localhost:8000/projects/${projectId}/notes`)
      .then(res => res.json())
      .then(setNotes)
      .catch(err => console.error('Failed to load notes', err));
  }, [projectId]);

  useEffect(() => {
    if (!selectedNote) return;
    fetch(`http://localhost:8000/projects/${projectId}/notes/${selectedNote}`)
      .then(res => res.text())
      .then(setNoteContent)
      .catch(err => {
        console.error('Failed to load note content', err);
        setNoteContent('');
      });
  }, [selectedNote, projectId]);

  const handleSave = () => {
    if (!selectedNote) return;
    setIsSaving(true);
    fetch(`http://localhost:8000/projects/${projectId}/notes/${selectedNote}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: noteContent,
    })
      .then(() => setIsSaving(false))
      .catch(err => {
        console.error('Failed to save note', err);
        setIsSaving(false);
      });
  };

  const handleNewNote = () => {
    const name = prompt('Enter a new note name (e.g., ideas.md):');
    if (!name) return;
    fetch(`http://localhost:8000/projects/${projectId}/notes/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: '',
    })
      .then(() => {
        setNotes(prev => [...prev, name]);
        setSelectedNote(name);
        setNoteContent('');
      })
      .catch(err => console.error('Failed to create note', err));
  };

  return (
    <div className="text-white text-sm space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-bold">📝 Notes</label>
        <button onClick={handleNewNote} className="text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-700">
          + New
        </button>
      </div>

      <select
        className="w-full bg-[#0d1b2a] text-white border border-gray-600 rounded p-1"
        value={selectedNote}
        onChange={(e) => setSelectedNote(e.target.value)}
      >
        <option value="">— Select Note —</option>
        {notes.map((note) => (
          <option key={note} value={note}>{note}</option>
        ))}
      </select>

      {selectedNote && (
        <>
          <textarea
            className="w-full h-64 p-2 border border-gray-700 rounded text-sm font-mono bg-[#0d1b2a] text-white"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : '💾 Save Note'}
          </button>
        </>
      )}
    </div>
  );
}
