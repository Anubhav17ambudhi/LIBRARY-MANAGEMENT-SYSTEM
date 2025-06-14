import cron from 'node-cron';
import { User } from '../models/user.model.js';

export const removeUnverifiedAccounts = () => {
  cron.schedule('*/5 * * * *', async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: thirtyMinutesAgo }
    });
  })
}