require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schema and Model for Entries
const entrySchema = new mongoose.Schema({
    heading: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    date: { type: String, default: new Date().toISOString() },
    isPrivate: { type: Boolean, default: false },
});

const Entry = mongoose.model('Entry', entrySchema);

// MongoDB Schema and Model for Passcode
const passcodeSchema = new mongoose.Schema({
    passcode: { type: String, required: true },
});

const Passcode = mongoose.model('Passcode', passcodeSchema);

// API to Get All Entries (Public or Private)
app.get('/get-entries', async (req, res) => {
    const { isPrivate, search } = req.query;
    try {
        const query = { isPrivate: isPrivate === 'true' };
        if (search) {
            query.$or = [
                { heading: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const entries = await Entry.find(query);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch entries', error: error.message });
    }
});

// API to Save Text
app.post('/save-text', async (req, res) => {
    const { heading, description, isPrivate } = req.body;
    if (!heading || !description) {
        return res.status(400).json({ message: 'Heading and description are required' });
    }

    try {
        const newEntry = new Entry({ heading, description, isPrivate });
        await newEntry.save();
        res.json({ message: 'Text saved successfully!', entry: newEntry });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save text', error: error.message });
    }
});

// API to Upload Image
app.post('/upload-image', async (req, res) => {
    const { imageUrl, isPrivate } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ message: 'Image URL is required' });
    }

    try {
        const newEntry = new Entry({ imageUrl, isPrivate });
        await newEntry.save();
        res.json({ message: 'Image saved successfully!', entry: newEntry });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save image', error: error.message });
    }
});

// API to Delete Entry
app.delete('/delete-entry/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Entry.findByIdAndDelete(id);
        res.json({ message: 'Entry deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete entry', error: error.message });
    }
});

// API to Update Entry
app.put('/update-entry/:id', async (req, res) => {
    const { id } = req.params;
    const { heading, description } = req.body;

    try {
        const updatedEntry = await Entry.findByIdAndUpdate(
            id,
            { heading, description },
            { new: true }
        );
        res.json({ message: 'Entry updated successfully!', entry: updatedEntry });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update entry', error: error.message });
    }
});

// API to Get Passcode
app.get('/get-passcode', async (req, res) => {
    try {
        const passcodeDoc = await Passcode.findOne();
        res.json({ passcode: passcodeDoc ? passcodeDoc.passcode : null });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch passcode', error: error.message });
    }
});

// API to Set Passcode
app.post('/set-passcode', async (req, res) => {
    const { passcode } = req.body;
    if (!passcode) {
        return res.status(400).json({ message: 'Passcode is required' });
    }

    try {
        let passcodeDoc = await Passcode.findOne();
        if (!passcodeDoc) {
            passcodeDoc = new Passcode({ passcode });
        } else {
            passcodeDoc.passcode = passcode;
        }
        await passcodeDoc.save();
        res.json({ message: 'Passcode set successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to set passcode', error: error.message });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});