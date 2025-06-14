export function generateVerificationOtpEmailTemplate(otpCode) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 500px;
            margin: auto;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2c3e50;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #e74c3c;
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            font-size: 14px;
            color: #777;
            text-align: center;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Library Management System</div>
          <p>Hello,</p>
          <p>Use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 15 minutes:</p>
          <div class="otp">${otpCode}</div>
          <p>If you did not request this, please ignore this email.</p>
          <div class="footer">&copy; ${new Date().getFullYear()} Library Management System</div>
        </div>
      </body>
    </html>
  `;
}

export function generteForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Reset Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            color: #4A90E2;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #333333;
            line-height: 1.6;
          }
          .button {
            display: block;
            width: max-content;
            margin: 30px auto;
            padding: 12px 24px;
            background-color: #4A90E2;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999999;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Bookworm Library Management System</div>
          <div class="message">
            <p>Hello,</p>
            <p>You recently requested to reset your password. Click the button below to reset it:</p>
            <a href="${resetPasswordUrl}" class="button">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Thank you,<br/>Bookworm Team</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Bookworm Library. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}
