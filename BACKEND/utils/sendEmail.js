import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, message }) => {
  if (!email || typeof email !== 'string' || !email.includes("@")) {
    throw new Error("Invalid or missing recipient email address.");
  }

  try {
    console.log("📧 Preparing to send email to:", email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      service: process.env.SMTP_SERVICE, // "gmail" if Gmail
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Library Management" <${process.env.SMTP_MAIL}>`,
      to: email,
      subject: subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw new Error("Email sending failed");
  }
};
