// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveNote = document.getElementById('saveNote');
const cancelEdit = document.getElementById('cancelEdit');
const notesContainer = document.getElementById('notesContainer');
const formTitle = document.getElementById('formTitle');
const exportTxt = document.getElementById('exportTxt');
const exportJson = document.getElementById('exportJson');

// State variables
let notes = [];
let editingNoteId = null;
let currentSort = 'newest';
let currentSearch = '';

// Initialize the app
function init() {
    loadNotes();
    renderNotes();
    setupEventListeners();
}

// Load notes from localStorage
function loadNotes() {
    const storedNotes = localStorage.getItem('smartNotes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
}

// Save notes to localStorage
function saveNotesToStorage() {
    localStorage.setItem('smartNotes', JSON.stringify(notes));
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderNotes();
    });
    
    // Sort functionality
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderNotes();
    });
    
    // Save note
    saveNote.addEventListener('click', saveNoteHandler);
    
    // Cancel edit
    cancelEdit.addEventListener('click', cancelEditHandler);
    
    // Export functionality
    exportTxt.addEventListener('click', exportAsTxt);
    exportJson.addEventListener('click', exportAsJson);
}

// Toggle between light and dark mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Save or update a note
function saveNoteHandler() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    if (editingNoteId) {
        // Update existing note
        const noteIndex = notes.findIndex(note => note.id === editingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].content = content;
            notes[noteIndex].lastEdited = new Date().toISOString();
        }
    } else {
        // Create new note
        const newNote = {
            id: Date.now().toString(),
            title,
            content,
            created: new Date().toISOString(),
            lastEdited: new Date().toISOString(),
            pinned: false,
            tags: generateTags(content),
            summary: generateSummary(content),
            mood: generateMood(content)
        };
        notes.unshift(newNote);
    }
    
    saveNotesToStorage();
    resetForm();
    renderNotes();
}

// Cancel editing and reset form
function cancelEditHandler() {
    resetForm();
}

// Reset the form to its default state
function resetForm() {
    noteTitle.value = '';
    noteContent.value = '';
    editingNoteId = null;
    formTitle.textContent = 'Add New Note';
    saveNote.textContent = 'Save Note';
    cancelEdit.style.display = 'none';
}

// Edit a note
function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        noteTitle.value = note.title;
        noteContent.value = note.content;
        editingNoteId = id;
        formTitle.textContent = 'Edit Note';
        saveNote.textContent = 'Update Note';
        cancelEdit.style.display = 'inline-block';
    }
}

// Delete a note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveNotesToStorage();
        renderNotes();
    }
}

// Toggle pin status of a note
function togglePin(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        note.pinned = !note.pinned;
        saveNotesToStorage();
        renderNotes();
    }
}

// Generate tags based on note content (mock implementation)
function generateTags(content) {
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    // Extract unique words that are not common words
    const uniqueWords = [...new Set(words.filter(word => 
        word.length > 3 && !commonWords.includes(word)
    ))];
    
    // Return first 3 unique words as tags
    return uniqueWords.slice(0, 3);
}

// Generate a summary based on note content (mock implementation)
function generateSummary(content) {
    // Simple implementation: take first 100 characters
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
}

// Generate mood based on note content (mock implementation)
function generateMood(content) {
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'upset'];
    
    const contentLower = content.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
        if (contentLower.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
        if (contentLower.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

// Render notes based on current search and sort
function renderNotes() {
    // Filter notes based on search
    let filteredNotes = notes.filter(note => {
        if (!currentSearch) return true;
        
        const searchLower = currentSearch.toLowerCase();
        return note.title.toLowerCase().includes(searchLower) || 
               note.content.toLowerCase().includes(searchLower) ||
               note.tags.some(tag => tag.toLowerCase().includes(searchLower));
    });
    
    // Sort notes
    if (currentSort === 'newest') {
        filteredNotes.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
    } else {
        filteredNotes.sort((a, b) => new Date(a.lastEdited) - new Date(b.lastEdited));
    }
    
    // Separate pinned and unpinned notes
    const pinnedNotes = filteredNotes.filter(note => note.pinned);
    const unpinnedNotes = filteredNotes.filter(note => !note.pinned);
    
    // Clear container
    notesContainer.innerHTML = '';
    
    // Display empty state if no notes
    if (filteredNotes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <h3>No notes found</h3>
            <p>${currentSearch ? 'Try adjusting your search terms' : 'Create your first note to get started'}</p>
        `;
        notesContainer.appendChild(emptyState);
        return;
    }
    
    // Render pinned notes first
    pinnedNotes.forEach(note => renderNoteCard(note));
    
    // Render unpinned notes
    unpinnedNotes.forEach(note => renderNoteCard(note));
}

// Render a single note card
function renderNoteCard(note) {
    const noteCard = document.createElement('div');
    noteCard.className = `note-card ${note.pinned ? 'pinned' : ''}`;
    
    // Format dates
    const createdDate = new Date(note.created).toLocaleDateString();
    const lastEditedDate = new Date(note.lastEdited).toLocaleDateString();
    
    // Highlight search terms in title and content if searching
    let displayTitle = note.title;
    let displayContent = note.summary;
    
    if (currentSearch) {
        const regex = new RegExp(`(${currentSearch})`, 'gi');
        displayTitle = displayTitle.replace(regex, '<span class="highlight">$1</span>');
        displayContent = displayContent.replace(regex, '<span class="highlight">$1</span>');
    }
    
    noteCard.innerHTML = `
        <button class="pin-btn" onclick="togglePin('${note.id}')">
            ${note.pinned ? '📌' : '📍'}
        </button>
        <h3 class="note-title">${displayTitle}</h3>
        <div class="note-content">${displayContent}</div>
        <div class="note-tags">
            ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="note-meta">
            <span>Created: ${createdDate}</span>
            <span>Mood: ${note.mood}</span>
        </div>
        <div class="note-actions-card">
            <button class="btn-edit" onclick="editNote('${note.id}')">Edit</button>
            <button class="btn-delete" onclick="deleteNote('${note.id}')">Delete</button>
        </div>
    `;
    
    notesContainer.appendChild(noteCard);
}

// Export notes as TXT
function exportAsTxt() {
    if (notes.length === 0) {
        alert('No notes to export');
        return;
    }
    
    let txtContent = 'SMART NOTES EXPORT\n\n';
    
    notes.forEach(note => {
        txtContent += `TITLE: ${note.title}\n`;
        txtContent += `CREATED: ${new Date(note.created).toLocaleDateString()}\n`;
        txtContent += `LAST EDITED: ${new Date(note.lastEdited).toLocaleDateString()}\n`;
        txtContent += `TAGS: ${note.tags.join(', ')}\n`;
        txtContent += `MOOD: ${note.mood}\n`;
        txtContent += `CONTENT:\n${note.content}\n\n`;
        txtContent += '='.repeat(50) + '\n\n';
    });
    
    downloadFile(txtContent, 'smart-notes.txt', 'text/plain');
}

// Export notes as JSON
function exportAsJson() {
    if (notes.length === 0) {
        alert('No notes to export');
        return;
    }
    
    const jsonContent = JSON.stringify(notes, null, 2);
    downloadFile(jsonContent, 'smart-notes.json', 'application/json');
}

// Helper function to download files
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
