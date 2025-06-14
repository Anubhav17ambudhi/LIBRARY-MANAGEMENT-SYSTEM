import { generateVerificationOtpEmailTemplate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationEmail(email,verificationCode,res) {
  try {
    console.log("📩 Preparing to send email to:", email);
    console.log("🔐 Using verification code:", verificationCode);

    const message  = generateVerificationOtpEmailTemplate(verificationCode);
    console.log("📧 Generated HTML message");
    await sendEmail({
      email,
      subject: "Verification Code(Bookworm Library Management System)",
      message,
    })
    console.log("✅ Email sent");
    res.status(200).json({
      success: true,
      message: "Verification code sent successfully.",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
}