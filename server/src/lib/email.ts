import 'dotenv/config';
import nodemailer from 'nodemailer';

type EmailMessage = {
    to: string,
    subject: string,
    text: string,
}

const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

if (!smtpPassword || !smtpUser) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must be configured.')
}

// Resuable nodemailer connection
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: smtpUser,
        pass: smtpPassword
    },
});

// Send email async function that takes in message as email type promises void
export async function sendEmail(message: EmailMessage):  Promise<void> {
    await transporter.sendMail({
        from: smtpUser,
        to: message.to,
        subject: message.subject,
        text: message.text,
    });
}

export async function verifyEmailConnection(): Promise<void> {
    await transporter.verify()
}

