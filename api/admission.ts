import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formData = req.body;

  if (!formData.email || !formData.studentName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const fromEmail = process.env.SMTP_FROM || 'Ashish Vidhyalay <noreply@ashishvidhyalay.com>';
  const adminEmail = process.env.ADMIN_EMAIL || 'admission@ashishvidhyalay.com';

  try {
    await Promise.all([
      transporter.sendMail({
        from: fromEmail,
        to: formData.email,
        subject: 'Admission Application Received - Ashish Vidhyalay',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #1e40af;">નમસ્તે ${formData.studentName},</h2>
            <p>આશિષ વિદ્યાલયમાં પ્રવેશ માટેની તમારી અરજી અમને મળી છે.</p>
            <p>અમારી ટીમ ટૂંક સમયમાં તમારી સાથે સંપર્ક કરશે.</p>
            <hr />
            <h3>અરજીની વિગતો:</h3>
            <ul>
              <li><strong>વિદ્યાર્થીનું નામ:</strong> ${formData.studentName}</li>
              <li><strong>ધોરણ:</strong> ${formData.grade}</li>
              <li><strong>મોબાઈલ નંબર:</strong> ${formData.mobile}</li>
            </ul>
            <p>આભાર,<br />આશિષ વિદ્યાલય, કેશરપુરા</p>
          </div>
        `,
      }),
      transporter.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: `New Admission Application: ${formData.studentName} (${formData.grade})`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #1e40af;">New Admission Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Student Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.studentName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Grade</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.grade}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Gender</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.gender}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>DOB</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.dob}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.mobile}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Address</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.address}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.email}</td></tr>
            </table>
          </div>
        `,
      }),
    ]);

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Email error:', message);
    res.status(500).json({ error: 'Failed to send emails. Check SMTP configuration.' });
  }
}