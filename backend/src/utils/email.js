const nodemailer = require('nodemailer');

// Create transporter based on email service
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.EMAIL_API_KEY
      }
    });
  }

  // Default to Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send appointment confirmation to user
const sendAppointmentConfirmation = async (appointment, user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Appointment Confirmation',
    html: `
      <h2>Appointment Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your appointment has been confirmed for:</p>
      <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.time}</p>
      ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
      <p>You can manage your appointment through your account dashboard.</p>
      <p>Thank you for choosing our service!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error to prevent blocking the appointment creation
  }
};

// Send notification to admin
const sendAdminNotification = async (appointment, user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Appointment Booking',
    html: `
      <h2>New Appointment Booking</h2>
      <p>A new appointment has been booked:</p>
      <p><strong>User:</strong> ${user.name} (${user.email})</p>
      <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.time}</p>
      ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending admin notification:', error);
    // Don't throw error to prevent blocking the appointment creation
  }
};

// Send appointment cancellation notification
const sendCancellationNotification = async (appointment, user) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Appointment Cancellation',
    html: `
      <h2>Appointment Cancellation</h2>
      <p>Dear ${user.name},</p>
      <p>Your appointment has been cancelled:</p>
      <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.time}</p>
      <p>You can book a new appointment through your account dashboard.</p>
      <p>Thank you for your understanding!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    // Don't throw error to prevent blocking the cancellation process
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAdminNotification,
  sendCancellationNotification
}; 