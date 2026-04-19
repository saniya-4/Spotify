const transporter =require('../config/mailer.js');

const sendStatusMail = async (request, status, adminNote) => {
  const isAccepted = status === "accepted";

  const subject = isAccepted
    ? `🎉 Your Ad Request Has Been Accepted — ${request.brand_name}`
    : `❌ Your Ad Request Was Rejected — ${request.brand_name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: #003A10; padding: 32px 40px;">
        <h1 style="color: #00FF5B; margin: 0; font-size: 22px; letter-spacing: 1px;">
          Spotify Ads
        </h1>
        <p style="color: #aaa; margin: 6px 0 0; font-size: 13px;">Ad Request Update</p>
      </div>

      <!-- Body -->
      <div style="background: #ffffff; padding: 36px 40px;">
        <p style="font-size: 16px; color: #333; margin-top: 0;">
          Hi <strong>${request.client_name}</strong>,
        </p>

        <p style="font-size: 15px; color: #555; line-height: 1.7;">
          ${
            isAccepted
              ? `We're excited to let you know that your ad request for <strong>${request.brand_name}</strong> has been <span style="color: #16a34a; font-weight: bold;">accepted</span>! Our team will reach out to you soon to get started.`
              : `Thank you for submitting your ad request for <strong>${request.brand_name}</strong>. Unfortunately, after review, your request has been <span style="color: #dc2626; font-weight: bold;">rejected</span> at this time.`
          }
        </p>

        ${
          adminNote
            ? `
          <div style="background: #f3f4f6; border-left: 4px solid ${isAccepted ? "#16a34a" : "#dc2626"}; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #666; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Admin Note</p>
            <p style="margin: 6px 0 0; font-size: 14px; color: #333;">${adminNote}</p>
          </div>`
            : ""
        }

        <!-- Request Summary -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 14px; font-size: 13px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">
            Your Request Summary
          </p>
          ${row("Product",   request.product)}
          ${row("Platform",  request.platform)}
          ${row("Ad Type",   request.ad_type)}
          ${row("Budget",    request.budget)}
          ${row("Deadline",  request.deadline)}
          ${row("Launch Date", request.target_launch_date)}
        </div>

        ${
          isAccepted
            ? `<p style="font-size: 14px; color: #555; line-height: 1.7;">
                We'll contact you at <strong>${request.email}</strong> or on 
                <strong>${request.phone}</strong> within 1–2 business days.
               </p>`
            : `<p style="font-size: 14px; color: #555; line-height: 1.7;">
                You're welcome to submit a new request with updated details. 
                We'd love to work with you in the future.
               </p>`
        }
      </div>

      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 20px 40px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #aaa;">
          This is an automated message from Spotify Admin · Please do not reply to this email.
        </p>
      </div>

    </div>
  `;

  await transporter.sendMail({
    from: `"Spotify Ads" <${process.env.EMAIL_USER}>`,
    to: request.email,
    subject,
    html,
  });
};

// helper for summary rows
const row = (label, value) => `
  <div style="display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px;">
    <span style="color: #888;">${label}</span>
    <span style="color: #333; font-weight: 500;">${value || "—"}</span>
  </div>
`;

module.exports = sendStatusMail;