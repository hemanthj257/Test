import { MailDataRequired } from '@sendgrid/mail';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendMessage = async (message: MailDataRequired) => {
  try {
    await sgMail.send(message);

    return Promise.resolve();
  } catch (err) {
    console.error('Error sending email:', err);
    return Promise.reject(err);
  }
};
