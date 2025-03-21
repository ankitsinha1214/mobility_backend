// userSandmModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Define the main user schema
const sandmUserSchema = new Schema({
  status: {
    type: String,
    required: true, // Adjust as per your requirement
    default: 'Active' // Example default status
  },
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Username cannot be empty'
    }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Password cannot be empty'
    }
  },
  company: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Company cannot be empty'
    }
  },
  department: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Department cannot be empty'
    }
  },
  name: {
    type: String,
    // required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Name cannot be empty'
    }
  },
  email: {
    type: String,
    // required: true,
    unique: false,
    sparse: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Email cannot be empty'
    }
  },
//   phone: {
//     type: String,
//     // required: true,
//     unique: true,
//     validate: {
//       validator: function(v) {
//         return /\S+/.test(v); // Ensures it's not just whitespace
//       },
//       message: 'Phone Number cannot be empty'
//     }
//   }
  phone: {
    prefix: {
      type: String,
    //   required: true,
      validate: {
        validator: function(v) {
          return /\S+/.test(v); // Ensures it's not just whitespace
        },
        message: 'Phone prefix cannot be empty'
      }
    },
    number: {
      type: String,
    //   required: true,
      unique: false,
      sparse: true,
      validate: {
        validator: function(v) {
          return /\S+/.test(v); // Ensures it's not just whitespace
        },
        message: 'Phone number cannot be empty'
      }
    }
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'User', 'Manager'], 
    default: 'User' // Default role
  },
  serviceID: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Hash password before saving
sandmUserSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Creating a partial unique index for email and phone number
sandmUserSchema.index({ email: 1 }, { unique: true, sparse: true });
sandmUserSchema.index({ 'phone.number': 1 }, { unique: true, sparse: true });
// Create a Mongoose model based on the schema
const SandmUser = mongoose.model('Service-and-maintenance-user', sandmUserSchema);

module.exports = SandmUser;
