import mongoose from 'mongoose';
import { AppointmentDocument } from '../types';

const appointmentSchema = new mongoose.Schema<AppointmentDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
    },
    time: {
      type: String,
      required: [true, 'Please add a time'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'] as const,
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    googleCalendarEventId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying appointments by date
appointmentSchema.index({ date: 1 });

// Index for querying appointments by user
appointmentSchema.index({ userId: 1 });

const Appointment = mongoose.model<AppointmentDocument>('Appointment', appointmentSchema);

export default Appointment; 