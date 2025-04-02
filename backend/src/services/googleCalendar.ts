import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleCalendarEvent } from '../types';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
};

export const getTokens = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export const createCalendarEvent = async (
  refreshToken: string,
  event: GoogleCalendarEvent
) => {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const calendarEvent = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return calendarEvent.data;
};

export const deleteCalendarEvent = async (
  refreshToken: string,
  eventId: string
) => {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
}; 