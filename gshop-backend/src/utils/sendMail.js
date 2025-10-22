// import axios from "axios";

// const sendMail = async (to, subject, message) => {
//   const provider = process.env.MAIL_PROVIDER || "console";

//   try {
//     if (provider === "resend") {
//       // 🔹 Resend email service
//       await axios.post(
//         "https://api.resend.com/emails",
//         {
//           from: process.env.RESEND_FROM,
//           to,
//           subject,
//           html: `<p>${message}</p>`,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log(`📧 Resend email sent to ${to}`);
//     } else if (provider === "termii") {
//       // 🔸 Termii SMS API
//       await axios.post("https://api.ng.termii.com/api/sms/send", {
//         api_key: process.env.TERMII_API_KEY,
//         to,
//         from: process.env.TERMII_SENDER || "GSHOP",
//         sms: message,
//         type: "plain",
//         channel: "generic",
//       });
//       console.log(`📱 Termii SMS sent to ${to}`);
//     } else {
//       console.log(`🧪 [DEV MODE] To: ${to} | ${subject} -> ${message}`);
//     }
//   } catch (error) {
//     console.error("❌ sendMail error:", error.response?.data || error.message);
//   }
// };

// export default sendMail;


// sendMail.js
// import axios from "axios";

// // Pick between Termii or Resend by setting MAIL_PROVIDER in .env
// const MAIL_PROVIDER = process.env.MAIL_PROVIDER || "resend";

// // Universal mail sender
// const sendMail = async (to, subject, message) => {
//   try {
//     if (MAIL_PROVIDER === "termii") {
//       // --- Termii API ---
//       const response = await axios.post("https://api.ng.termii.com/api/email/send", {
//         api_key: process.env.TERMII_API_KEY,
//         to,
//         from: process.env.TERMII_SENDER,
//         subject,
//         html_body: `<p>${message}</p>`,
//       });
//       return response.data;
//     } else {
//       // --- Resend API ---
//       const response = await axios.post(
//         "https://api.resend.com/emails",
//         {
//           from: process.env.RESEND_SENDER,
//           to,
//           subject,
//           html: `<p>${message}</p>`,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       return response.data;
//     }
//   } catch (error) {
//     console.error("Mail send error:", error.message);
//   }
// };

// export default sendMail;

// sendMail.js
import axios from "axios";

const MAIL_PROVIDER = process.env.MAIL_PROVIDER || "resend"; // resend | termii
const OTP_CHANNEL = process.env.OTP_CHANNEL || "email"; // email | sms

/**
 * Universal notification sender for G-Shop
 * - Supports both Email (Resend/Termii) and SMS (Termii)
 *
 * @param {string} to - Recipient email or phone number
 * @param {string} subject - Email subject
 * @param {string} message - Body content or OTP message
 */
const sendMail = async (to, subject, message) => {
  try {
    if (OTP_CHANNEL === "sms") {
      // ====== TERMII SMS API ======
      const response = await axios.post("https://api.ng.termii.com/api/sms/send", {
        api_key: process.env.TERMII_API_KEY,
        to,
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: "plain",
        channel: "generic",
      });
      console.log("✅ SMS sent via Termii");
      return response.data;

    } else if (MAIL_PROVIDER === "termii") {
      // ====== TERMII EMAIL API ======
      const response = await axios.post("https://api.ng.termii.com/api/email/send", {
        api_key: process.env.TERMII_API_KEY,
        to,
        from: process.env.TERMII_EMAIL_SENDER,
        subject,
        html_body: `<p>${message}</p>`,
      });
      console.log("✅ Email sent via Termii");
      return response.data;

    } else {
      // ====== RESEND EMAIL API ======
      const response = await axios.post(
        "https://api.resend.com/emails",
        {
          from: process.env.RESEND_SENDER,
          to,
          subject,
          html: `<p>${message}</p>`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Email sent via Resend");
      return response.data;
    }
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
  }
};

export default sendMail;
