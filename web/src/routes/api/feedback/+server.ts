import {
  EMAIL,
  EMAIL_KEY,
  EMAIL_SMTP_SERVICE,
} from '$env/static/private';
import nodemailer from 'nodemailer';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent): Promise<Response> => {
  try {
    const { name, email, content } = await request.json();
    const transporter = nodemailer.createTransport({
      service: EMAIL_SMTP_SERVICE,
      auth: {
        user: EMAIL,
        pass: EMAIL_KEY
      },
    });

    await transporter.sendMail({
      from: email,
      to: EMAIL,
      subject: `[T00LK1T: Feedback] ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${content}`
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
