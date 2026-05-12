import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "alikamatu14@gmail.com",
    pass: process.env.SMTP_PASS || "ehkk dujj xler zxhf",
  },
});

function baseTemplate(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 20px;">
              <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">🎓 UPSA Class</span>
            </div>
            <p style="color:rgba(255,255,255,0.85);margin:12px 0 0;font-size:14px;">Classroom Allocation System</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:700;">${title}</h2>
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">University of Professional Studies, Accra &bull; IT Department</p>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:11px;">Do not share this email. If you didn't request this, ignore it.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(to: string, code: string, fullName: string) {
  const body = `
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi <strong>${fullName}</strong>, welcome to UPSA Class! Enter the code below to verify your email address.</p>
    <div style="background:#eff6ff;border:2px dashed #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Verification Code</p>
      <p style="margin:0;color:#1e40af;font-size:40px;font-weight:800;letter-spacing:12px;">${code}</p>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:0;">This code expires in <strong>10 minutes</strong>. Use your Student ID <strong>${to.split("@")[0]}</strong> to verify.</p>`;

  await transporter.sendMail({
    from: `"UPSA Class" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} – Your UPSA Class verification code`,
    html: baseTemplate("Verify your email", body),
  });
}

export async function sendPasswordResetEmail(to: string, code: string, fullName: string) {
  const body = `
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">Hi <strong>${fullName}</strong>, we received a request to reset your password. Use the code below.</p>
    <div style="background:#fff7ed;border:2px dashed #fed7aa;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Reset Code</p>
      <p style="margin:0;color:#c2410c;font-size:40px;font-weight:800;letter-spacing:12px;">${code}</p>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:0;">This code expires in <strong>15 minutes</strong>. If you didn't request this, your account is safe — ignore this email.</p>`;

  await transporter.sendMail({
    from: `"UPSA Class" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} – Reset your UPSA Class password`,
    html: baseTemplate("Password Reset", body),
  });
}

export async function sendWelcomeEmail(to: string, fullName: string) {
  const body = `
    <p style="color:#475569;margin:0 0 16px;line-height:1.6;">Hi <strong>${fullName}</strong>, your UPSA Class account is now active!</p>
    <p style="color:#475569;margin:0 0 24px;line-height:1.6;">You can now log in to view your timetable, check hall allocations, and stay up to date with your academic schedule.</p>
    <div style="text-align:center;">
      <a href="${process.env.NEXTAUTH_URL}/login" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:600;font-size:15px;">Go to Portal</a>
    </div>`;

  await transporter.sendMail({
    from: `"UPSA Class" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to UPSA Class 🎓",
    html: baseTemplate("Account Activated", body),
  });
}
