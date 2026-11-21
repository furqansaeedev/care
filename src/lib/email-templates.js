const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #F9FBF9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #0B6B3A; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 30px; color: #1F2A37; line-height: 1.6; }
    .button { display: inline-block; background-color: #1A8F4D; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { background-color: #E6F7EC; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>MediCare+</h1></div>
    <div class="content">${content}</div>
    <div class="footer"><p>&copy; ${new Date().getFullYear()} MediCare+. All rights reserved.</p></div>
  </div>
</body>
</html>
`;

export const activationEmail = (name, link) => baseTemplate(`
  <h2>Welcome to MediCare+, ${name}!</h2>
  <p>Please verify your email address by clicking the button below:</p>
  <div style="text-align: center;"><a href="${link}" class="button">Verify My Account</a></div>
  <p style="margin-top: 30px; font-size: 12px; color: #2DBFA9; word-break: break-all;">${link}</p>
`);

export const passwordResetEmail = (name, link) => baseTemplate(`
  <h2>Password Reset Request</h2>
  <p>Hi ${name}, click the button below to set a new password:</p>
  <div style="text-align: center;"><a href="${link}" class="button">Reset Password</a></div>
  <p style="margin-top: 30px; font-size: 12px; color: #2DBFA9; word-break: break-all;">${link}</p>
`);

export const appointmentBookedEmail = (doctorName, patientName, date, time) => baseTemplate(`
  <h2>New Appointment Request</h2>
  <p>Dear Dr. ${doctorName},</p>
  <p>You have a new appointment request from <strong>${patientName}</strong>.</p>
  <ul>
    <li><strong>Date:</strong> ${date}</li>
    <li><strong>Time:</strong> ${time}</li>
  </ul>
  <p>Please log in to your dashboard to confirm or cancel this appointment.</p>
  <div style="text-align: center;"><a href="${process.env.APP_URL}/appointments?view=dashboard" class="button">View Appointments</a></div>
`);

export const appointmentConfirmedEmail = (patientName, doctorName, date, time) => baseTemplate(`
  <h2>Appointment Confirmed</h2>
  <p>Dear ${patientName},</p>
  <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been confirmed.</p>
  <ul>
    <li><strong>Date:</strong> ${date}</li>
    <li><strong>Time:</strong> ${time}</li>
  </ul>
  <p>You can join the video consultation from your dashboard.</p>
  <div style="text-align: center;"><a href="${process.env.APP_URL}/appointments" class="button">View Appointments</a></div>
`);