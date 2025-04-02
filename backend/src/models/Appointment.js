const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed'],
    default: 'booked'
  },
  googleCalendarEventId: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Index for querying appointments by date and time
appointmentSchema.index({ date: 1, time: 1 });

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
  const appointmentDateTime = new Date(`${this.date}T${this.time}`);
  return appointmentDateTime < new Date();
});

// Method to check if slot is available
appointmentSchema.statics.isSlotAvailable = async function(date, time) {
  const existingAppointment = await this.findOne({
    date,
    time,
    status: 'booked'
  });
  return !existingAppointment;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 