const express = require('express');
const bodyParser = require('body-parser');

const { Sequelize, DataTypes } = require('sequelize');
const nodemailer = require('nodemailer');

const router = express.Router();
router.use(bodyParser.json());


const sequelize = new Sequelize('Event', 'postgres', 'Gokul123@', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432',
});

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

(async () => {
  try {
    await sequelize.sync();
    console.log('Event Database synced');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();

router.post('/events', async (req, res) => {
  const { title, start, end, createdBy } = req.body;

  try {
    const event = await Event.create({
      title,
      start,
      end,
      createdBy,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Event creation failed' });
  }
});

router.put('/events/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { title, start, end, createdBy } = req.body;

  try {
    const event = await Event.findOne({ where: { id: eventId } });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.update({
      title,
      start,
      end,
      createdBy,
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Event update failed' });
  }
});

router.delete('/events/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);

  try {
    const event = await Event.findOne({ where: { id: eventId } });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.destroy();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Event deletion failed' });
  }
});


router.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.delete('/eventtime/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.destroy({ where: { id: eventId } });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
