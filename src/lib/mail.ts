import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  code: string,
  firstName: string,
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Welcome to Bamba Tickets, ${firstName}!</h2>
      <p>Thank you for registering. Please use the verification code below to complete your setup:</p>
      
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #f97316;">
        ${code}
      </div>
      
      <p>If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bamba Tickets" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${code} is your Bamba Tickets verification code`,
      html: htmlContent,
    });
    console.log("Verification email dispatched to:", email);
  } catch (error) {
    console.error("Error sending verification email via Gmail:", error);
  }
}
