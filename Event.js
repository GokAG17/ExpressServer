const express = require('express');
const bodyParser = require('body-parser');

const { Sequelize, DataTypes } = require('sequelize');
const nodemailer = require('nodemailer');

const router = express.Router();
router.use(bodyParser.json());


const sequelize = new Sequelize('Signup', 'postgres', '2004', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5433',
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

const BookedSlot = sequelize.define('BookedSlot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  guide: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  members: {
    type: DataTypes.ARRAY(DataTypes.STRING),
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

router.post('/book-slot', async (req, res) => {
  const { date, startTime, endTime, guide, members } = req.body;

  try {
    const bookedSlot = await BookedSlot.create({
      date,
      startTime,
      endTime,
      guide,
      members,
    });

    res.status(201).json(bookedSlot);
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Slot booking failed' });
  }
});

// API endpoint to fetch booked slots
router.get('/booked-slots', async (req, res) => {
  try {
    const bookedSlots = await BookedSlot.findAll(); // Change 'Booking' to 'BookedSlot'
    res.json(bookedSlots);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
});

// Add this route to your server code
router.delete('/booked-slots/:id', async (req, res) => {
  const slotId = parseInt(req.params.id);

  try {
    const bookedSlot = await BookedSlot.findOne({ where: { id: slotId } });

    if (!bookedSlot) {
      return res.status(404).json({ error: 'Booked slot not found' });
    }

    await bookedSlot.destroy();

    res.json({ message: 'Booked slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting booked slot:', error);
    res.status(500).json({ error: 'Booked slot deletion failed' });
  }
});

router.get('/eventfilter', async (req, res) => {
  try {
    // Get the title from the query parameter
    const { title } = req.query;

    // Perform the database query to find events with the given title
    const events = await Event.findAll({
      where: {
        title: title // Filter events based on the provided title
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});




module.exports = router;
