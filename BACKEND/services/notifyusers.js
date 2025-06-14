import cron from 'node-cron';
import { Borrow } from '../models/borrow.model.js';
import { User } from '../models/user.model.js';
import { sendEmail } from '../utils/sendEmail.js';
export const notifyUsers = () => {
  cron.schedule('*/10 * * * * *', async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const borrowers = await Borrow.find({
        dueDate: { $lt: oneDayAgo },
        returnDate: null,
        notified: false
      })

      for(const element of borrowers){
        if(element.user && element.user.email) {
          sendEmail({
            email: element.user.email,
            subject: "Book Return Reminder",
            message: `Dear ${element.user.name},\n\nThis is a reminder that the book "${element.book.title}" is overdue.
            Please return it as soon as possible to avoid any late fees.\n\nThank you!`
          })
          element.notified = true;
          await element.save();
          console.log(`Notification sent to ${element.user.email} for overdue book: ${element.book.title}`);
        }
      }
    } catch (error) {
      console.error('Error in notifyUsers:', error);
    }
  });
}