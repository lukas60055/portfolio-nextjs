import nodemailer from 'nodemailer';
import validator from 'validator';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return new Response('Bad Request: Missing required fields', {
        status: 400,
      });
    }

    if (!validator.isEmail(email) || !validator.isLength(message, { min: 8 })) {
      return new Response('Bad Request: Invalid input data', {
        status: 400,
      });
    }

    const safeName = validator.escape(name);
    const safeMessage = validator.escape(message);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_ADDRESS,
        pass: process.env.SMTP_PASSWORD,
      },
      secure: true,
    });

    const mailOptions = {
      from: `"${safeName}" <${email}>`,
      to: process.env.SMTP_ADDRESS,
      subject: 'Contact - LukasPro.pl',
      html: `
        <strong>Name: </strong>${safeName}<br>
        <strong>E-mail: </strong> ${email}<br><br>
        <strong>Message: </strong> ${safeMessage}
        `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return new Response('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      return new Response('Internal Server Error', {
        status: 500,
      });
    }
  } catch {
    return new Response('Bad Request', { status: 400 });
  }
}
