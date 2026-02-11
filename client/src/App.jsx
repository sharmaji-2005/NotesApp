import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Zap,
  Home,
  Star,
  Archive,
  Plus,
  Search,
  Trash2,
  X,
  Save
} from 'lucide-react';
import './index.css';

const API_URL = '/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${currentNote.id}`, currentNote);
        setNotes(notes.map(note => (note.id === currentNote.id ? currentNote : note)));
      } else {
        const response = await axios.post(API_URL, currentNote);
        setNotes([...notes, response.data]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const openModal = (note = null) => {
    if (note) {
      setCurrentNote(note);
      setIsEditing(true);
    } else {
      setCurrentNote({ title: '', content: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentNote({ title: '', content: '' });
    setIsEditing(false);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Zap className="text-indigo-500" size={24} fill="currentColor" />
          <span>NOTEFLOW</span>
        </div>
        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home size={18} /> Dashboard
          </div>
          <div
            className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Star size={18} /> Favorites
          </div>
          <div
            className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            <Archive size={18} /> Archive
          </div>
        </nav>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> New Note
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search your thoughts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="user-profile flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Welcome back!</span>
            <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="Profile" />
          </div>
        </header>

        <section className="notes-grid">
          {/* Create Note Card (First Item) */}
          <div className="note-card add-note" onClick={() => openModal()}>
            <Plus />
            <p>Create Note</p>
          </div>

          {filteredNotes.map((note, index) => (
            <div
              key={note.id}
              className={`note-card ${index % 2 === 0 ? '' : 'highlight'}`}
              onClick={() => openModal(note)}
            >
              <div className="note-header">
                <span className={`badge ${index % 2 === 0 ? 'blue' : 'yellow'}`}>
                  {index % 2 === 0 ? 'Work' : 'Idea'}
                </span>
                <div className="flex gap-2">
                  <Star
                    size={16}
                    className={index % 2 !== 0 ? "fill-yellow-600 text-yellow-600" : "text-slate-400"}
                  />
                  <Trash2
                    size={16}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                    onClick={(e) => handleDelete(note.id, e)}
                  />
                </div>
              </div>
              <h3 className="note-title">{note.title}</h3>
              <p className="note-excerpt">
                {note.content}
              </p>
              <div className="note-footer">
                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Modal - Reused logic, styled with Tailwind for simplicity on top of custom CSS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {isEditing ? 'Edit Note' : 'New Note'}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Note Title"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800"
                  autoFocus
                />
              </div>

              <div>
                <textarea
                  placeholder="Type your content here..."
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  className="w-full h-40 py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-slate-600 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
