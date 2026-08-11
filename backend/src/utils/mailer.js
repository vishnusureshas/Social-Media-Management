import nodemailer from 'nodemailer';
import config from '../config/env.js';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html }) => {
  if (!config.smtp.user || !config.smtp.pass) {
    console.log(`[mailer] SMTP not configured — would send to ${to} :: subject "${subject}"`);
    return { skipped: true };
  }

  const info = await getTransporter().sendMail({
    from: `"Social Platform" <${config.smtp.user}>`,
    to,
    subject,
    html,
  });

  console.log(`[mailer] email sent to ${to} :: messageId ${info.messageId}`);
  return info;
};

export { sendMail };