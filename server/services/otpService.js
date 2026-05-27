import { Resend } from "resend";
import crypto from "crypto";
import OTP from "../models/otpModel.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send OTP email
export default async function sendOtpMail(email) {
  const otp = crypto.randomInt(100000, 999999).toString();
  await OTP.findOneAndUpdate({ email }, { otp }, { upsert: true });

  const html = OtpEmail({ otp });

  resend.emails.send({
    from: `StorageApp <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "StorageApp Verification Code",
    html,
  });
}

// React component for OTP email template
function OtpEmail({ otp }) {
  return `
  <div style="background:#f4f6f8;padding:40px;font-family:Arial,sans-serif;">
    <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:10px;text-align:center;">
      
      <h2 style="color:#333;">StorageApp Verification</h2>
      
      <p style="font-size:16px;color:#555;">
        Your OTP verification code is:
      </p>

      <div style="
        font-size:34px;
        font-weight:bold;
        letter-spacing:8px;
        color:#4f46e5;
        margin:25px 0;
      ">
        ${otp}
      </div>

      <p style="color:#777;font-size:14px;">
        This code is valid for 3 minutes.
      </p>

      <hr style="margin:25px 0;border:none;border-top:1px solid #eee;" />

      <p style="font-size:12px;color:#999;">
        If you didn't request this code, you can safely ignore this email.
      </p>

    </div>
  </div>
  `;
}
