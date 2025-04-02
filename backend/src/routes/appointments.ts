import express from 'express';
import { google } from 'googleapis';
import { AppError } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import Appointment from '../models/Appointment';
import User from '../models/User';
import { AuthRequest, RequestHandler } from '../types';
import { createCalendarEvent, deleteCalendarEvent } from '../services/googleCalendar';

const router = express.Router();
const calendar = google.calendar('v3');

// Get all appointments for a user
router.get('/', protect, (async (req: AuthRequest, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user?._id });
    res.json({
      status: 'success',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

// Create a new appointment
router.post('/', protect, (async (req: AuthRequest, res, next) => {
  try {
    const { date, time, notes } = req.body;

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      date,
      time,
      status: 'scheduled',
    });

    if (existingAppointment) {
      return next(new AppError('This time slot is already booked', 400));
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId: req.user?._id,
      date,
      time,
      notes,
    });

    // If user has Google Calendar connected, create event
    if (req.user?.googleCalendarId) {
      const event = {
        summary: 'Appointment',
        description: notes || 'No notes provided',
        start: {
          dateTime: `${date}T${time}`,
          timeZone: 'UTC',
        },
        end: {
          dateTime: `${date}T${time}`,
          timeZone: 'UTC',
        },
      };

      const calendarEvent = await createCalendarEvent(
        req.user.googleCalendarId,
        event
      );

      appointment.googleCalendarEventId = calendarEvent.id;
      await appointment.save();
    }

    res.status(201).json({
      status: 'success',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

// Cancel an appointment
router.patch('/:id/cancel', protect, (async (req: AuthRequest, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (appointment.status === 'cancelled') {
      return next(new AppError('Appointment is already cancelled', 400));
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // If appointment has Google Calendar event, delete it
    if (appointment.googleCalendarEventId && req.user?.googleCalendarId) {
      await deleteCalendarEvent(
        req.user.googleCalendarId,
        appointment.googleCalendarEventId
      );
    }

    res.json({
      status: 'success',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default router; 