const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) !== 587, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

// Never throws — a broken/unconfigured mail server should never break a
// booking. Failures are logged and swallowed.
async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`SMTP not configured — skipped email "${subject}" to ${to}`);
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text
    });
    return true;
  } catch (err) {
    console.error(`Email send failed ("${subject}" to ${to}):`, err.message);
    return false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function bookingConfirmationEmail({ user, appointment, service }) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#7a2e8f;">Booking Confirmed</h2>
      <p>Hi ${user.name},</p>
      <p>Your consultation has been booked. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#766b80;">Service</td><td style="padding:6px 0;font-weight:bold;">${service.name}</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Date</td><td style="padding:6px 0;font-weight:bold;">${formatDate(appointment.date)}</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Time</td><td style="padding:6px 0;font-weight:bold;">${appointment.slot}</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Mode</td><td style="padding:6px 0;font-weight:bold;text-transform:capitalize;">${appointment.mode}</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Status</td><td style="padding:6px 0;font-weight:bold;text-transform:capitalize;">${appointment.status}</td></tr>
      </table>
      <p>We'll confirm your slot shortly if it's still pending. You can view or manage this booking anytime from your dashboard.</p>
      <p style="color:#766b80;font-size:0.85rem;margin-top:24px;">— EnrgyAstro</p>
    </div>
  `;
  const text = `Booking Confirmed\n\nService: ${service.name}\nDate: ${formatDate(appointment.date)}\nTime: ${appointment.slot}\nMode: ${appointment.mode}\nStatus: ${appointment.status}`;
  return { html, text };
}

function adminBookingNotificationEmail({ user, appointment, service }) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#7a2e8f;">New Booking Received</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#766b80;">Client</td><td style="padding:6px 0;font-weight:bold;">${user.name} (${user.email}, ${user.phone})</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Service</td><td style="padding:6px 0;font-weight:bold;">${service.name}</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Date</td><td style="padding:6px 0;font-weight:bold;">${formatDate(appointment.date)}</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Time</td><td style="padding:6px 0;font-weight:bold;">${appointment.slot}</td></tr>
        <tr><td style="padding:6px 0;color:#766b80;">Mode</td><td style="padding:6px 0;font-weight:bold;text-transform:capitalize;">${appointment.mode}</td></tr>
        ${appointment.concern ? `<tr><td style="padding:6px 0;color:#766b80;">Concern</td><td style="padding:6px 0;">${appointment.concern}</td></tr>` : ''}
      </table>
      <p><a href="${process.env.BASE_URL || ''}/admin/appointments" style="color:#7a2e8f;">View in admin dashboard →</a></p>
    </div>
  `;
  return { html, text: `New booking from ${user.name} for ${service.name} on ${formatDate(appointment.date)} at ${appointment.slot}.` };
}

module.exports = { sendMail, bookingConfirmationEmail, adminBookingNotificationEmail };
