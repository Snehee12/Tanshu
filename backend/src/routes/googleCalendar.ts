import express from 'express';
import { AppError } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { getAuthUrl, getTokens } from '../services/googleCalendar';
import User from '../models/User';
import { AuthRequest, RequestHandler } from '../types';

const router = express.Router();

// Get Google Calendar auth URL
router.get('/auth', protect, (async (req: AuthRequest, res) => {
  const authUrl = getAuthUrl();
  res.json({ authUrl });
}) as RequestHandler);

// Handle Google Calendar callback
router.get('/callback', protect, (async (req: AuthRequest, res, next) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return next(new AppError('Invalid authorization code', 400));
    }

    const tokens = await getTokens(code);

    // Update user with refresh token
    await User.findByIdAndUpdate(req.user?._id, {
      googleCalendarId: tokens.refresh_token,
    });

    res.redirect('/appointments');
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default router; 