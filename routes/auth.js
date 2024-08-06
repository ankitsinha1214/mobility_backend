const express = require("express");
const User = require("../models/User")
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const res = require("express/lib/response");
const JWT_SECRET = '#serviceAndMaintenance123';
var fetchuser = require('../middleware/fetchuser');

// Function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'geniacadmy@gmail.com',
    pass: 'vfxs wkbm uebw vlsh'
  }
});

router.post('/signup', [
  body('name', "enter valid name").isLength({ min: 1 }),
  body('email', "enter valid email").isEmail(),
  body('password', "enter valid password").isLength({ min: 5 }),
],

  async (req, res) => {
    let success = false;
    //If there are errors return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success:success, errors: errors.array() });
    }
    //to check if user has same email or not
    try {
      let user = await User.findOne({ email: req.body.email })
      if (user) {
        return res.status(400).json({ success:false,error: "Sorry user email already exist please try to login" })
      }
      // Generate an OTP
      const otp = generateOTP();

      // Send the OTP to the user's email
      const mailOptions = {
        from: 'geniacadmy@gmail.com',
        to: req.body.email,
        subject: 'OTP Verification',
        text: `Your OTP for signup is: ${otp}`
      };
await transporter.sendMail(mailOptions);
        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt);

        //creating a user
        user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: secpass,
          otp: otp
        })

        res.json({ success:true, message: "OTP sent Successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("some error occured while sending OTP Please Try Again!");
    }
  }
)

router.post('/verifyotp', async (req, res) => {
  const { email, otp } = req.body;

  try {
      // Find the OTP record for the user
      const userRecord = await User.findOne({ email: email });

      if (!userRecord) {
          return res.status(400).json({ success:false, error: "OTP not found for the user. Please Try SignUp Again" });
      }

      // Check if the OTP matches
      if (userRecord.otp === otp) {
        userRecord.otp_verified = true;
        await userRecord.save();
          const data = {
              user: {
                  id: userRecord.id
              }
          };

          const authtoken = jwt.sign(data, JWT_SECRET);

          return res.json({ success:true, token:authtoken, id: userRecord.id });
      } else {
          return res.status(400).json({ success:false, error: "Invalid OTP" });
      }
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occurred");
  }
});

router.post('/resendotp', async (req, res) => {
  const { email } = req.body;

  try {
      // Find the user by email
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(400).json({ error: "User not found with this email!" });
      }

      // Generate a new OTP
      const otp = generateOTP();

      // Update the user's OTP
      user.otp = otp;
      await user.save();

      // Send the OTP to the user
      const mailOptions = {
        from: 'geniacadmy@gmail.com',
        to: req.body.email,
        subject: 'OTP Verification',
        text: `Your OTP for signup is: ${otp}`
      };

      const otpSent = await transporter.sendMail(mailOptions);

      if (!otpSent) {
          return res.status(500).json({ error: "Failed to send OTP. Please try again later." });
      }

      return res.json({ success: true, message: "OTP has been resent successfully!" });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occurred");
  }
});
// login 
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be empty').exists(),
], async (req, res) => {
  let success = false;

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res.status(400).json({ success:false ,error: "Email doesnot Exist" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success:false , error: "Please try to login with correct credentials" });
    }

    if(!user.otp_verified){
      return res.status(400).json({ success:false , error: "Your Account is not verified yet! Please Verify it" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ success:true, token:authtoken, id: user.id })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

//getall users
router.get('/users', fetchuser,  async (req, res) => {
  try {
    // Fetch all users, excluding the password field
    const users = await User.find().select("-password -otp_verified -otp");
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// API to retrieve user details by user ID
router.get('/user/:id', fetchuser, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password -otp_verified -otp");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;