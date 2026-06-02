import nodemailer from "nodemailer";

const sentEmail = async ({ to, subject, text, html }) => {
  try {
    const isEmailConfigured =
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS;

    if (!isEmailConfigured) {
      console.log(`\n ---------MOCK EMAIL-----------`);
      console.log(`\n To: ${to} \n Subject: ${subject} \n Message:${text}`);
      console.log("\n -------------------------------");
      return { success: true, mode: "mock" };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "lMS"} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`email sent successfully to:${to} ${info.messageId}`);
    return { success: true, mode: "real", info };
  } catch (error) {
    console.error("error while sending email", error);
    throw error;
  }
};

export default sentEmail;
