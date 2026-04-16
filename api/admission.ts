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
          <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6; color: #111;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e5e7eb;">
              <tr>
                <td style="background: #1e3a8a; padding: 24px 30px; text-align: center;">
                  <p style="display: inline-block; margin: 0 0 10px; padding: 4px 10px; background: #ffffff; color: #1e3a8a; border-radius: 999px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">ઉન્નતિ એજ્યુકેશન ટ્રસ્ટ</p>
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px;">આશિષ વિદ્યાલય</h1>
                  <p style="margin: 8px 0 0; color: #dbeafe; font-size: 14px;">Admission Application Received</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 30px 24px;">
                  <p style="font-size: 16px; margin: 0 0 18px;">નમસ્તે ${formData.studentName},</p>
                  <p style="font-size: 15px; line-height: 1.7; margin: 0 0 22px;">તમારી પ્રવેશ અરજી અમને સફળતાપૂર્વક મળી ગઈ છે. અમારી ટીમ ટૂંક સમયમાં આપનો સંપર્ક કરશે.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px; background: #eef2ff; border-radius: 14px;">
                        <p style="margin: 0 0 12px; font-size: 14px; color: #1e40af; font-weight: 700;">અરજીની વિગતો</p>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; width: 36%; font-weight: 600;">વિદ્યાર્થીનું નામ</td>
                            <td style="padding: 8px 0;">${formData.studentName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-weight: 600;">ધોરણ</td>
                            <td style="padding: 8px 0;">${formData.grade}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-weight: 600;">મોબાઈલ</td>
                            <td style="padding: 8px 0;">${formData.mobile}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 15px; line-height: 1.7; margin: 0 0 20px;">જો તમને કોઈ પ્રશ્ન હોય, તો કૃપા કરીને આ ઇમેઇલ દ્વારા સંપર્ક કરો: <a href="mailto:admission@ashishvidhyalay.com" style="color: #1e3a8a; text-decoration: none;">admission@ashishvidhyalay.com</a> અથવા આ નંબર પર કૉલ કરો: <a href="tel:9925650820" style="color: #1e3a8a; text-decoration: none;">9925650820</a>.</p>
                  <p style="font-size: 15px; line-height: 1.7; margin: 0;">આભાર,<br/>આશિષ વિદ્યાલય</p>
                </td>
              </tr>
              <tr>
                <td style="background: #f8fafc; padding: 18px 30px; text-align: center; font-size: 13px; color: #6b7280;">
                  આ ઇમેઇલ આપની અરજી માટે આપમેળે મોકલવામાં આવેલ છે.
                </td>
              </tr>
              <tr>
                <td style="background: #f8fafc; padding: 10px 30px 20px; text-align: center; font-size: 12px; color: #475569;">
                  Powered by <a href="https://spaceon.in" style="color: #1e3a8a; text-decoration: none;">SpaceOn Technology</a>
                </td>
              </tr>
            </table>
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