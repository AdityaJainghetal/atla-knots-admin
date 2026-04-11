

const Contact = require("../../module/contactmodule/contactmodule");
const nodemailer = require("nodemailer");
const axios = require("axios");

// ✅ SMTP transporter for domain email
const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net", // domain SMTP
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createContactMessage = async (req, res) => {
  try {
    const { usernamee, email, phone, subject, message, captcha } = req.body;

    // ✅ required fields
    // if (!usernamee || !email || !phone || !subject || !message) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "All fields are required",
    //   });
    // }

    // ✅ captcha check
    if (!captcha) {
      return res.status(400).json({
        success: false,
        message: "Please complete reCAPTCHA verification.",
      });
    }

    // ✅ captcha verification
    const verificationResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captcha,
          remoteip: req.ip,
        },
      }
    );

    if (!verificationResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed",
      });
    }

    // ✅ save to DB
    const contact = await Contact.create({
      usernamee,
      email,
      phone,
      subject,
      message,
    });

    // ✅ admin mail
    await transporter.sendMail({
      from: `"ATLA Knots Website" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message: ${subject}`,
      html: `
      <h2>New Contact Enquiry</h2>
      <p><b>Name:</b> ${usernamee}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b> ${message}</p>
      `,
    });

    // ✅ user confirmation mail
    await transporter.sendMail({
      from: `"ATLA Knots Solution" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message`,
      html: `
      <h2>Thank you ${usernamee}</h2>
      <p>Your message has been received.</p>
      <p>We will contact you soon.</p>
      <hr/>
      <p><b>Your Message:</b></p>
      <p>${message}</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all contact messages
const getContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a contact message by ID
const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact message not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Contact message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  deleteContactMessage,
};
