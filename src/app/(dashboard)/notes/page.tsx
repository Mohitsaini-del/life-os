"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit3, FiSearch, FiClock, FiX } from "react-icons/fi";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function Notes() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveOrUpdateNote() {
    if (!title || !content) return;

    try {
      if (editingId) {
        // Update existing note (PUT)
        await fetch("/api/notes", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: editingId,
            title,
            content
          })
        });
        setEditingId(null);
      } else {
        // Create new note (POST)
        await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            content
          })
        });
      }

      setTitle("");
      setContent("");
      loadNotes();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  }

  function startEdit(note: NoteItem) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
  }

  async function deleteNote(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await fetch(`/api/notes?id=${id}`, {
        method: "DELETE"
      });
      if (editingId === id) {
        cancelEdit();
      }
      loadNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Second Brain 🧠</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
          Your personal knowledge base. Capture thoughts, ideas, and references.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Note Creator/Editor */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-4 sticky top-6">
            <h3 className="text-base font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {editingId ? "Edit Note" : "Create New Note"}
            </h3>
            
            <div className="space-y-4">
              <input
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-650 text-zinc-900 dark:text-zinc-50"
                placeholder="Note Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-650 text-zinc-900 dark:text-zinc-50 min-h-[200px]"
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={saveOrUpdateNote}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {editingId ? "Update Note" : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      Save Note
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-905 transition cursor-pointer"
                    title="Cancel editing"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search & Notes List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
              <FiSearch className="w-5 h-5" />
            </div>
            <input
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-12 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-900 dark:text-zinc-50 shadow-sm"
              placeholder="Search your notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredNotes.map((note) => (
                <div 
                  key={note.id}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 leading-tight">{note.title}</h3>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(note)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition cursor-pointer"
                          title="Edit Note"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                          title="Delete Note"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-2 flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" />
                      {new Date(note.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>

                    {/* Content text */}
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4 leading-relaxed font-medium whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-850 text-zinc-400 dark:text-zinc-500 font-medium">
              {searchQuery ? "No notes found matching your search term." : "Your second brain is empty. Capture your first note in the box on the left!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}