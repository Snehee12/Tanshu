const express = require('express');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');
const { sendAppointmentConfirmation } = require('../utils/email');
const { createGoogleCalendarEvent } = require('../utils/googleCalendar');

const router = express.Router();

// Get user's appointments
router.get('/', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book an appointment
router.post('/book', protect, async (req, res) => {
  try {
    const { date, time, notes } = req.body;

    // Check if slot is available
    const isAvailable = await Appointment.isSlotAvailable(date, time);
    if (!isAvailable) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId: req.user.id,
      date,
      time,
      notes
    });

    // Create Google Calendar event if user has Google Calendar integration
    if (req.user.googleCalendarId) {
      const eventId = await createGoogleCalendarEvent(appointment, req.user);
      appointment.googleCalendarEventId = eventId;
      await appointment.save();
    }

    // Send confirmation email
    await sendAppointmentConfirmation(appointment, req.user);

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel an appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    // If there's a Google Calendar event, delete it
    if (appointment.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(appointment.googleCalendarEventId);
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reschedule an appointment
router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if new slot is available
    const isAvailable = await Appointment.isSlotAvailable(date, time);
    if (!isAvailable) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Update appointment
    appointment.date = date;
    appointment.time = time;
    await appointment.save();

    // Update Google Calendar event if exists
    if (appointment.googleCalendarEventId) {
      await updateGoogleCalendarEvent(appointment);
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 