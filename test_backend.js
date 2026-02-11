const API_URL = 'http://localhost:5000/api/notes';

async function testBackend() {
    console.log('--- Starting Backend Tests ---');

    // 1. Create a Note
    console.log('\n[TEST] Creating a new note...');
    const newNote = {
        title: 'Test Note',
        content: 'This is a test note from the verification script.',
        color: '#ff0000'
    };

    let createdNoteId;

    try {
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNote)
        });

        if (!createRes.ok) throw new Error(`Failed to create note: ${createRes.statusText}`);
        const createdNote = await createRes.json();
        createdNoteId = createdNote.id;
        console.log('✅ Note created:', createdNote);

        // 2. Get All Notes
        console.log('\n[TEST] Fetching all notes...');
        const getRes = await fetch(API_URL);
        if (!getRes.ok) throw new Error(`Failed to fetch notes: ${getRes.statusText}`);
        const notes = await getRes.json();
        console.log('✅ Notes fetched. Count:', notes.length);

        const foundNote = notes.find(n => n.id === createdNoteId);
        if (foundNote) {
            console.log('✅ Created note found in list.');
        } else {
            console.error('❌ Created note NOT found in list.');
        }

        // 3. Update Note
        console.log('\n[TEST] Updating the note...');
        const updatedData = { ...newNote, title: 'Updated Test Note' };
        const updateRes = await fetch(`${API_URL}/${createdNoteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!updateRes.ok) throw new Error(`Failed to update note: ${updateRes.statusText}`);
        const updatedNote = await updateRes.json();
        console.log('✅ Note updated:', updatedNote);

        // 4. Delete Note
        console.log('\n[TEST] Deleting the note...');
        const deleteRes = await fetch(`${API_URL}/${createdNoteId}`, {
            method: 'DELETE'
        });

        if (!deleteRes.ok) throw new Error(`Failed to delete note: ${deleteRes.statusText}`);
        console.log('✅ Note deleted successfully.');

        // Verify Delete
        const verifyRes = await fetch(API_URL);
        const finalNotes = await verifyRes.json();
        if (!finalNotes.find(n => n.id === createdNoteId)) {
            console.log('✅ Verification: Note is gone.');
        } else {
            console.error('❌ Verification: Note still exists!');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }

    console.log('\n--- Backend Tests Complete ---');
}

testBackend();
