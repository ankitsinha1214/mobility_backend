const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userVehicleSchema = new Schema({
  make: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Make cannot be empty'
    }
  },
  model: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Model cannot be empty'
    }
  },
  variant: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Variant cannot be empty'
    }
  },
  vehicle_reg: {
    type: String,
    // required: true,
    // unique: true,  // Ensures vehicle_reg is unique
    // immutable: true, 
    // validate: {
    //   validator: function(v) {
    //     return /\S+/.test(v); // Ensures it's not just whitespace
    //   },
      // message: 'Vehicle Registration cannot be empty'
    // }
  },
  range: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Range cannot be empty'
    }
  },
  vehicle_img: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'image url cannot be empty'
    }
  }
});
// }, { _id: false });

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'First Name cannot be empty'
    }
  },
  lastName: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Last Name cannot be empty'
    }
  },
  status: {
    type: String,
    required: true, // Adjust as per your requirement
    default: 'active' // Example default status
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Phone Number cannot be empty'
    }
  },
  state: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'State cannot be empty'
    }
  },
  city: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'City cannot be empty'
    }
  },
  dob: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Date Of Birth cannot be empty'
    }
  },
  gender: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Gender cannot be empty'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Email cannot be empty'
    }
  },
  // password: {
  //   type: String,
  //   required: true,
  //   validate: {
  //     validator: function(v) {
  //       return /\S+/.test(v); // Ensures it's not just whitespace
  //     },
  //     message: 'Password cannot be empty'
  //   }
  // },
  profilePic: {
    type: String,
    default: null
  },
  user_vehicle: {
    type: [userVehicleSchema], // This makes user_vehicle an array of userVehicleSchema
    required: false // This is optional based on your needs
  }
}, { timestamps: true });

// Hash password before saving
// userSchema.pre('save', async function(next) {
//   try {
//     if (!this.isModified('password')) {
//       return next();
//     }
//     const hashedPassword = await bcrypt.hash(this.password, 10);
//     this.password = hashedPassword;
//     return next();
//   } catch (error) {
//     return next(error);
//   }
// });

// Create a Mongoose model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
