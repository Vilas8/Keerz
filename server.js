import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Custom Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=0, must-revalidate');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/send-emails', async (req, res) => {
  const { leadData } = req.body;

  if (!leadData) {
    return res.status(400).json({ error: 'Missing lead data' });
  }

  // Use variables with fallback to user's provided credentials
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || 'keerthanatm2465@gmail.com').trim();
  const smtpPassRaw = process.env.SMTP_PASS || process.env.GMAIL_PASS || 'wdjrlhiqigtwqhqv';
  const smtpPass = smtpPassRaw.replace(/\s+/g, '');
  const smtpFrom = (process.env.SMTP_FROM_EMAIL || smtpUser).trim();

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    // 1. Email for the Candidate
    const candidateMailOptions = {
      from: `"Keerz Aviation Academy" <${smtpFrom}>`,
      to: leadData.email,
      subject: 'Welcome Aboard! - Keerz Aviation Academy',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; color: #0f172a; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #079992; margin: 0; font-size: 24px; letter-spacing: 1px;">KEERZ AVIATION ACADEMY</h2>
            <span style="font-size: 10px; color: #AA7C11; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">Interest List Confirmed</span>
          </div>
          
          <p>Dear <strong>${leadData.full_name}</strong>,</p>
          
          <p>Thank you for your valuable support in completing our aviation training survey! We are thrilled to connect with aspiring professionals like you.</p>
          
          <p>We have successfully registered your interest in the future <strong>Keerz Cabin Crew Academy</strong>. You can view, print, or download your official <strong>Boarding Survey Pass</strong> directly from the website's success screen.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #079992; margin-bottom: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Registration Details</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Passenger Name:</td><td style="padding: 6px 0; font-weight: bold;">${leadData.full_name}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Training City:</td><td style="padding: 6px 0; font-weight: bold; color: #079992;">Nagamangala, Karnataka</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Age Group:</td><td style="padding: 6px 0; font-weight: bold;">${leadData.age_group} Yrs</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Training Mode:</td><td style="padding: 6px 0; font-weight: bold;">${leadData.training_mode}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Seat Assignment:</td><td style="padding: 6px 0; font-weight: bold; color: #059669;">#${leadData.seriousness_score || 5}A-LEAD</td></tr>
            </table>
          </div>

          <p>Our training city is centered in <strong>Nagamangala, Karnataka</strong>, and we are planning curriculum launches designed to jumpstart your career. We will notify you via email and phone as soon as cohort schedules and admission processes launch!</p>
          
          <p>Thank you again for your time and feedback.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b; text-align: center;">
            <strong>Keerz Aviation Academy</strong><br/>
            Contact: keerthanatm2465@gmail.com
          </div>
        </div>
      `
    };

    // 2. Email for Admin
    const adminMailOptions = {
      from: `"Keerz Alert" <${smtpFrom}>`,
      to: 'keerthanatm2465@gmail.com',
      subject: `[Survey Response Alert] - ${leadData.full_name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; color: #0f172a; background-color: #ffffff;">
          <h2 style="color: #079992; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">New Response Received</h2>
          <p>A new boarding pass survey has been submitted. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
            <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; width: 40%; border-bottom: 1px solid #e2e8f0;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.full_name}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Mobile:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.mobile}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">WhatsApp:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.whatsapp || 'Same / None'}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.email}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Age Group:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.age_group} Yrs</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Qualification:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.qualification}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">State:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.state}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">City:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.city}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Training Mode:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.training_mode}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Timeline:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.joining_timeline}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Seriousness Score:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #079992;">${leadData.seriousness_score} / 5</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Career Interests:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${Array.isArray(leadData.selected_careers) ? leadData.selected_careers.join(', ') : leadData.selected_careers}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Topics of Interest:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${Array.isArray(leadData.selected_training_topics) ? leadData.selected_training_topics.join(', ') : leadData.selected_training_topics}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Biggest Challenge:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${leadData.biggest_challenge || 'None Shared'}</td></tr>
          </table>
        </div>
      `
    };

    let candidateSuccess = false;
    let adminSuccess = false;
    let mailError = null;

    try {
      await transporter.sendMail(candidateMailOptions);
      candidateSuccess = true;
    } catch (err) {
      console.error('Failed to send candidate email:', err);
      mailError = err;
    }

    try {
      await transporter.sendMail(adminMailOptions);
      adminSuccess = true;
    } catch (err) {
      console.error('Failed to send admin email:', err);
      mailError = err;
    }

    if (!candidateSuccess && !adminSuccess) {
      throw mailError || new Error('Both candidate and admin emails failed to send.');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Emails processed.',
      candidateSuccess,
      adminSuccess
    });
  } catch (err) {
    console.error('SMTP Mail Dispatch Error:', err);
    return res.status(500).json({ error: err.message || 'Error occurred while sending mail.' });
  }
});

// Serve static assets from Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all other client-side routing to index.html
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server launched on port ${PORT}`);
});
