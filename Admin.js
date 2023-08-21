const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Circular, Message } = require('./AdminModel');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Create Circular
router.post('/createCircular', async (req, res) => {
  try {
    const { title, content, recipients, pdfUrl } = req.body;
    const newCircular = await Circular.create({ title, content, recipients, pdfUrl });
    res.status(201).json(newCircular);
  } catch (error) {
    console.error('Error creating circular:', error);
    res.status(500).json({ error: 'Error creating circular' });
  }
});

// Create Message
router.post('/createMessage', async (req, res) => {
  try {
    const { title, content, recipients, pdfUrl } = req.body;
    const newMessage = await Message.create({ title, content, recipients, pdfUrl });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Error creating message' });
  }
});

router.post('/uploadPdf', upload.single('pdf'), (req, res) => {
  try {
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file); // Check if req.file is defined
    if (!req.file) {
      console.error('No PDF file received.');
      res.status(400).json({ error: 'No PDF file received.' });
      return;
    }

    const pdfUrl = req.file.path;

    console.log('PDF Upload Successful:', pdfUrl); // Debugging statement

    res.json({ pdfUrl });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Error uploading PDF' });
  }
});

// Fetch Circulars
router.get('/circulars', async (req, res) => {
  try {
    const circulars = await Circular.findAll();
    res.json(circulars);
  } catch (error) {
    console.error('Error fetching circulars:', error);
    res.status(500).json({ error: 'Error fetching circulars' });
  }
});

// Fetch Messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Delete Circular
router.delete('/deleteCircular/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Circular.destroy({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting circular:', error);
    res.status(500).json({ error: 'Error deleting circular' });
  }
});

// Delete Message
router.delete('/deleteMessage/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Message.destroy({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message' });
  }
});



module.exports = router;
