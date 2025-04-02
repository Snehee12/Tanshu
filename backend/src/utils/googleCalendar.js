const { google } = require('googleapis');
const User = require('../models/User');

// Configure Google Calendar API
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Create a new calendar event
const createGoogleCalendarEvent = async (appointment, user) => {
  try {
    if (!user.googleCalendarId) {
      throw new Error('User has not connected Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Set credentials for the user
    oauth2Client.setCredentials({
      refresh_token: user.googleCalendarId
    });

    const event = {
      summary: 'Appointment',
      description: appointment.notes || 'No notes provided',
      start: {
        dateTime: `${appointment.date}T${appointment.time}`,
        timeZone: 'UTC',
      },
      end: {
        dateTime: `${appointment.date}T${appointment.time}`,
        timeZone: 'UTC',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.data.id;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

// Update an existing calendar event
const updateGoogleCalendarEvent = async (appointment) => {
  try {
    if (!appointment.googleCalendarEventId) {
      throw new Error('No Google Calendar event ID found');
    }

    const user = await User.findById(appointment.userId);
    if (!user.googleCalendarId) {
      throw new Error('User has not connected Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Set credentials for the user
    oauth2Client.setCredentials({
      refresh_token: user.googleCalendarId
    });

    const event = {
      summary: 'Appointment',
      description: appointment.notes || 'No notes provided',
      start: {
        dateTime: `${appointment.date}T${appointment.time}`,
        timeZone: 'UTC',
      },
      end: {
        dateTime: `${appointment.date}T${appointment.time}`,
        timeZone: 'UTC',
      },
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId: appointment.googleCalendarEventId,
      resource: event,
    });

    return true;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
};

// Delete a calendar event
const deleteGoogleCalendarEvent = async (eventId) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
};

// Get Google Calendar authorization URL
const getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
};

// Handle Google Calendar callback
const handleGoogleCallback = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    return tokens.refresh_token;
  } catch (error) {
    console.error('Error handling Google callback:', error);
    throw error;
  }
};

module.exports = {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getGoogleAuthUrl,
  handleGoogleCallback
}; 