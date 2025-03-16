let entries = []; // Store all entries
let isPrivateMode = false; // Default to public mode
let passcode = null; // Store the passcode

// Load all entries on page load
window.onload = () => {
    loadAllEntries();
};

// Open a modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Close a modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Load all entries
async function loadAllEntries() {
    try {
        const response = await fetch(`/get-entries?isPrivate=${isPrivateMode}`);
        entries = await response.json();
        displayEntries(entries);
        console.log(entries);
    } catch (error) {
        console.error('Error loading entries:', error);
    }
}

// Display entries
function displayEntries(entries) {
    const resultsDiv = document.getElementById('allResults');
    resultsDiv.innerHTML = entries.map(entry => `
        <div class="entry-card">
            <div class="actions">
                <button class="update" onclick="openUpdateModal('${entry._id}')">Update</button>
                <button onclick="deleteEntry('${entry._id}')">Delete</button>
            </div>
            <h3>${entry.heading || 'Image Entry'} ${entry.isPrivate ? '<span class="private-tag"></span>' : ''}</h3>
            ${entry.description ? `<p>${entry.description}</p>` : ''}
            ${entry.imageUrl ? `<img src="${entry.imageUrl}" alt="Uploaded Image">` : ''}
            <p><small>${new Date(entry.date).toLocaleString()}</small></p>
        </div>
    `).join('');
}

// Search entries
function searchAllEntries() {
    const searchText = document.getElementById('searchAll').value.toLowerCase();
    const filteredEntries = entries.filter(entry =>
        (entry.heading && entry.heading.toLowerCase().includes(searchText)) ||
        (entry.description && entry.description.toLowerCase().includes(searchText))
    );
    displayEntries(filteredEntries);
}

// Save text
async function saveText() {
    const heading = document.getElementById('heading').value;
    const description = document.getElementById('description').value;
    const isPrivate = isPrivateMode; // Set isPrivate based on the current mode

    try {
        const response = await fetch('/save-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heading, description, isPrivate })
        });
        const data = await response.json();
        alert(data.message || 'Text saved successfully!');
        closeModal('textModal');
        loadAllEntries(); // Refresh entries
    } catch (error) {
        alert('Failed to save text.');
    }
}

// Upload image
async function uploadImage() {
    const file = document.getElementById('imageInput').files[0];
    const isPrivate = isPrivateMode; // Set isPrivate based on the current mode
    const formData = new FormData();
    formData.append('image', file);
    formData.append('isPrivate', isPrivate);

    try {
        const response = await fetch('/upload-image', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        alert(data.message || 'Image uploaded successfully!');
        closeModal('imageModal');
        loadAllEntries(); // Refresh entries
    } catch (error) {
        alert('Failed to upload image.');
    }
}

// Open private section modal
async function openPrivateSection() {
    const response = await fetch('/get-passcode');
    const data = await response.json();
    passcode = data.passcode;

    if (!passcode) {
        const newPasscode = prompt('Set a new passcode (numbers only):');
        if (newPasscode) {
            await fetch('/set-passcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode: newPasscode })
            });
            passcode = newPasscode;
        }
    }

    openModal('privateModal');
}

// Enter private section
function enterPrivateSection() {
    const enteredPasscode = document.getElementById('passcode').value;
    if (enteredPasscode == passcode) {
        isPrivateMode = true;
        document.getElementById('privateButton').style.display = 'none';
        document.getElementById('exitPrivateButton').style.display = 'inline-block';
        closeModal('privateModal');
        loadAllEntries(); // Refresh entries
    } else {
        alert('Incorrect passcode!');
    }
}

// Exit private section
function exitPrivateSection() {
    isPrivateMode = false;
    document.getElementById('privateButton').style.display = 'inline-block';
    document.getElementById('exitPrivateButton').style.display = 'none';
    loadAllEntries(); // Refresh entries
}