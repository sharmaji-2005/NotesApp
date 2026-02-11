const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'notes.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper to read notes
const readNotes = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading notes:', err);
        return [];
    }
};

// Helper to write notes
const writeNotes = (notes) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing notes:', err);
        return false;
    }
};

// GET all notes
app.get('/api/notes', (req, res) => {
    const notes = readNotes();
    res.json(notes);
});

// POST new note
app.post('/api/notes', (req, res) => {
    const { title, content, color } = req.body;
    if (!title && !content) {
        return res.status(400).json({ error: 'Title or content required' });
    }

    const notes = readNotes();
    const newNote = {
        id: Date.now().toString(),
        title: title || 'Untitled',
        content: content || '',
        color: color || '#ffffff',
        createdAt: new Date().toISOString()
    };

    notes.push(newNote);
    if (writeNotes(notes)) {
        res.status(201).json(newNote);
    } else {
        res.status(500).json({ error: 'Failed to save note' });
    }
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    let notes = readNotes();
    const initialLength = notes.length;
    notes = notes.filter(note => note.id !== id);

    if (notes.length === initialLength) {
        return res.status(404).json({ error: 'Note not found' });
    }

    if (writeNotes(notes)) {
        res.json({ message: 'Note deleted' });
    } else {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// PUT update note
app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, color } = req.body;

    let notes = readNotes();
    const noteIndex = notes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = { ...notes[noteIndex], title, content, color, updatedAt: new Date().toISOString() };
    notes[noteIndex] = updatedNote;

    if (writeNotes(notes)) {
        res.json(updatedNote);
    } else {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
