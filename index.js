const DB_URL = process.env.DB_URL || 'https://your-github-pages-url.com/api';

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
}

async function saveText() {
    const heading = document.getElementById('heading').value;
    const description = document.getElementById('description').value;
    const date = new Date().toISOString();

    try {
        const response = await fetch(`${DB_URL}/save-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heading, description, date })
        });
        const data = await response.json();
        alert(data.message || 'Text saved successfully!');
    } catch (error) {
        alert('Failed to save text.');
    }
}

async function uploadImage() {
    const file = document.getElementById('imageInput').files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${DB_URL}/upload-image`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        alert(data.message || 'Image uploaded successfully!');
    } catch (error) {
        alert('Failed to upload image.');
    }
}

async function searchEntries() {
    const text = document.getElementById('searchText').value;
    const date = document.getElementById('searchDate').value;

    try {
        const response = await fetch(`${DB_URL}/search?text=${text}&date=${date}`);
        const data = await response.json();
        document.getElementById('results').innerHTML = data.map(entry => `
            <div>
                <h3>${entry.heading}</h3>
                <p>${entry.description}</p>
                <p>${entry.date}</p>
            </div>
        `).join('');
    } catch (error) {
        alert('Failed to search entries.');
    }
}