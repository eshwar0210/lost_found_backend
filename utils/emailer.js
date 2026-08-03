const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (
    transporter ||
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  initTransporter();
  if (!transporter) {
    console.log('SMTP not configured — skipping email notification.');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

const sendNotificationEmail = async ({ to, name, actorName, kind, preview, link }) => {
  const isComment = kind === 'comment';
  const subject = isComment
    ? `${actorName || 'Someone'} commented on your post`
    : `${actorName || 'Someone'} messaged you on Lost & Found`;
  const headline = isComment
    ? `${actorName || 'Someone'} commented on your post`
    : `${actorName || 'Someone'} sent you a message`;
  const buttonLabel = isComment ? 'View the post' : 'Open the chat';
  const subtext = isComment
    ? 'Reply on the post to help reunite the owner with their item.'
    : 'Reply in the app to keep the conversation going.';

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#0ea5e9);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">LF</div>
        <span style="font-weight:800;color:#0f172a;font-size:16px">Lost &amp; Found</span>
      </div>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
        <h2 style="margin:0 0 6px;color:#0f172a;font-size:18px">Hi ${name},</h2>
        <p style="margin:0 0 16px;color:#334155">${headline}:</p>
        <div style="padding:14px 16px;background:#f1f5f9;border-left:4px solid #4f46e5;border-radius:8px;color:#0f172a;font-size:15px;line-height:1.5">"${preview}"</div>
        <p style="margin:16px 0 0;color:#64748b;font-size:13px">${subtext}</p>
        <a href="${link}" style="display:inline-block;margin-top:20px;padding:12px 22px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px">${buttonLabel}</a>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:12px">If the button doesn't work, open this link: <a href="${link}" style="color:#4f46e5">${link}</a></p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">Sent to you by Lost &amp; Found · Campus Community</p>
    </div>
  `;

  const plainText = `${headline}: "${preview}" — ${buttonLabel}: ${link}`;

  await sendEmail({ to, subject, text: plainText, html });
};

module.exports = { sendEmail, sendNotificationEmail, initTransporter };
