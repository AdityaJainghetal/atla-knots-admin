

const Contact = require("../../module/contactmodule/contactmodule");
const nodemailer = require("nodemailer");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createContactMessage = async (req, res) => {
  try {
    // ✅ Frontend sends "name", so we destructure "name" (not "usernamee")
    const { usernamee, email, phone, subject, message, captcha } = req.body;

    // ✅ 1. Check required fields
    if (!usernamee || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ 2. Check captcha token presence
    if (!captcha) {
      return res.status(400).json({
        success: false,
        message: "Please complete reCAPTCHA verification.",
      });
    }

    // ✅ 3. Verify reCAPTCHA with Google (before saving to DB)
    const verificationResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret:
            process.env.RECAPTCHA_SECRET_KEY ||
            "6LfP7nEsAAAAAAQtIwfaaTZYscG5QDae558ts0Xo",
          response: captcha,
          remoteip: req.ip,
        },
      }
    );

    if (!verificationResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    // ✅ 4. Save to MongoDB (only after captcha passes)
    const contact = await Contact.create({
      usernamee,   // make sure your Mongoose schema uses "name" (see note below)
      email,
      phone,
      subject,
      message,
    });

    // ✅ 5. Send notification email to admin
    await transporter.sendMail({
      from: `"Website Enquiry" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Message: ${subject}`,
      html: `
        <h2 style="color:#c0392b;">New Contact Enquiry</h2>
        <p><b>Name:</b> ${usernamee}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    // ✅ 6. Send confirmation email to the user
    await transporter.sendMail({
      from: `"ATLA Knots Solution" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message — ${subject}`,
      html: `
        <h2 style="color:#c0392b;">Thank you, ${usernamee}!</h2>
        <p>We have received your message and will get back to you within 1–2 business days.</p>
        <hr/>
        <p><b>Your message:</b><br/>${message}</p>
        <br/>
        <p style="color:#888;">ATLA Knots Solution | +91 78696 36070 | admin@atlaknots.com</p>
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
      message: "Something went wrong",
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
