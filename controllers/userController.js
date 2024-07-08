// userController.js

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { USER } = require("../message.json");

// Update user password
const updatepassword = async (req, res) => {
    const { username, oldpassword, newpassword } = req.body;

    if (!oldpassword || !newpassword) {
        return res.json({ success: false, message: "Old password or new password cannot be empty" });
    }

    try {
        const user = await User.findOne({ username });

        if (user) {
            const passwordMatch = await bcrypt.compare(oldpassword, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Old password is incorrect' });
            }

            if (oldpassword === newpassword) {
                return res.status(401).json({ success: false, message: 'Old and new password cannot be the same' });
            }

            const hashedPassword = await bcrypt.hash(newpassword, 10);
            user.password = hashedPassword;
            await user.save();

            return res.json({ success: true, message: "Password updated successfully" });
        } else {
            return res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

// Check user for password reset
const checkUserForResetPassword = async (req, res) => {
    const { username, phoneNumberLast4Digits } = req.body;

    if (!username || !phoneNumberLast4Digits) {
        return res.json({ success: false, message: "Username and last 4 digits of phone number are required" });
    }

    try {
        const user = await User.findOne({ username });

        if (user) {
            const userPhoneNumberLast4Digits = user.phoneNumber.slice(-4);

            if (userPhoneNumberLast4Digits === phoneNumberLast4Digits) {
                return res.json({ success: true, message: "User exists and phone number digits match" });
            } else {
                return res.json({ success: false, message: "Last 4 digits of phone number do not match" });
            }
        } else {
            return res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

// Reset user password
const resetpassword = async (req, res) => {
    const { username, newpassword } = req.body;

    if (!username || !newpassword) {
        return res.json({ success: false, message: "Username or new password cannot be empty" });
    }

    try {
        const user = await User.findOne({ username });

        if (user) {
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            user.password = hashedPassword;
            await user.save();

            return res.json({ success: true, message: "Password reset successfully" });
        } else {
            return res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

// User login
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const userDataToSend = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                username: user.username,
                avatar: user.avatar,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            return res.status(200).json({ success: true, data: userDataToSend });
        } else {
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

// Add user
const addUser = async (req, res) => {
    const { phoneNumber, user_vehicle } = req.body;

    // Validate user_vehicle fields
    // const requiredVehicleFields = ['make', 'model', 'variant', 'vehicle_reg', 'range'];
    // for (const field of requiredVehicleFields) {
    //   if (!user_vehicle || !user_vehicle[field]) {
    //     return res.json({ success: false, message: `User vehicle ${field} is required` });
    //   }
    // }

    try {
        const existingUser = await User.findOne({ phoneNumber });

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const newUser = new User(req.body);
        await newUser.save();

        const userDataToSend = {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phoneNumber: newUser.phoneNumber,
            state: newUser.state,
            city: newUser.city,
            dob: newUser.dob,
            gender: newUser.gender,
            email: newUser.email,
            profilePic: newUser.profilePic,
            user_vehicle: newUser.user_vehicle, // Adding the user_vehicle field
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        };

        return res.json({ success: true, data: userDataToSend, message: USER.USER_CREATED });
    } catch (error) {
        console.error('Error:', error);
        if (error.keyValue) {
            return res.status(500).json({ success: false, message: `${error.keyValue.email} Email already exist. Please check!`, error: error.message });
        }
        // if(error.keyValue){
        //     return res.status(500).json({ success: false, message: `${error.keyValue['user_vehicle.vehicle_reg']} Vehicle Registeration already exist. Please check!`, error: error.message });
        // }
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};


// Get all users
const getUser = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });

        if (users.length > 0) {
            return res.json({ success: true, data: users });
        } else {
            return res.json({ success: false, message: USER.USER_NOT_FOUND });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id, { password: 0 });

        if (user) {
            return res.json({ success: true, data: user });
        } else {
            return res.json({ success: false, message: USER.USER_NOT_FOUND });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// Update user by ID
const updateUser = async (req, res) => {
    const { phoneNumber } = req.params;
    const { gender, email, date_of_birth, ...updateFields } = req.body;

    // Check if restricted fields are in the request body
    if (gender || email || date_of_birth) {
        return res.json({
            success: false,
            message: "Updating gender, email, or date of birth is not allowed"
        });
    }

    try {
        // console.log(phoneNumber);
        const userBeforeUpdate = await User.findOne({ phoneNumber: phoneNumber });
        // console.log(userBeforeUpdate);
        if (!userBeforeUpdate) {
            return res.json({ success: false, message: "User not found" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            updateFields,
            { new: true }
        );

        // Check if any fields were actually updated
        const fieldsUpdated = Object.keys(updateFields).some(key => userBeforeUpdate[key] !== updatedUser[key]);

        if (fieldsUpdated) {
            return res.json({ success: true, message: "User updated successfully", user: updatedUser });
        } else {
            return res.json({ success: false, message: "No fields were updated" });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};


// Delete user by ID
// const deleteUser = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const deletedUser = await User.findByIdAndDelete(id);

//         if (deletedUser) {
//             return res.json({ success: true, message: USER.USER_DELETED });
//         } else {
//             return res.json({ success: false, message: USER.USER_NOT_FOUND });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
//     }
// };

const deleteUser = async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        // Find the user by phoneNumber
        const user = await User.findOne({ phoneNumber });

        if (user) {
            // Create an object with only the fields to keep
            // const updatedUser = {
            //     user_vehicle: user.user_vehicle
            // };

            const updatedUser = {
                user_vehicle: user.user_vehicle.map(vehicle => {
                    const { vehicle_reg, ...rest } = vehicle._doc || vehicle;
                    return rest;
                })
            };

            // Iterate over the user object and set all other fields to null, including phoneNumber
            for (const key in user._doc) {
                if (key !== '_id' && key !== 'user_vehicle') {
                    updatedUser[key] = null;
                }
                // else if(key === 'phoneNumber'){&& key !== 'phoneNumber'
                //     updateUser[key] = user._id;
                // }
            }
            updatedUser.phoneNumber = user._id;
            updatedUser.email = user._id;
            // Update the user document
            await User.findByIdAndUpdate(user._id, updatedUser, { new: true });

            return res.json({ success: true, message: USER.USER_DELETED  });
        } else {
            return res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};
// add a new vehicle for user
const addUserVehicle = async (req, res) => {
    const { phoneNumber } = req.params;
    const { make, model, variant, vehicle_reg, range, vehicle_img } = req.body;

    try {
        // Check if the vehicle registration already exists
        //   const existingVehicle = await User.findOne({
        //     phoneNumber
        //     ,
        //     'user_vehicle.vehicle_reg': vehicle_reg
        //   });

        //   if (existingVehicle) {
        //     return res.status(400).json({ success: false, message: 'Vehicle registration already exists' });
        //   }
        const existingVehicle = await User.findOne({
            phoneNumber,
            'user_vehicle.make': make,
            'user_vehicle.model': model,
            'user_vehicle.variant': variant
        });

        if (existingVehicle) {
            return res.status(400).json({ success: false, message: 'Vehicle with the same make, model, and variant already exists for this user' });
        }

        // Create a new vehicle object
        const newVehicle = { make, model, variant, vehicle_reg, range, vehicle_img };

        // Push the new vehicle object to the user's user_vehicle array
        const user = await User.findOneAndUpdate(
            { phoneNumber },
            { $push: { user_vehicle: newVehicle } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.json({ success: true, data: newVehicle, message: 'Vehicle added successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
    }
};



// get all vehicle of a user
const getUserVehicles = async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, data: user.user_vehicle });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// get specific vehicle
const getUserVehicleById = async (req, res) => {
    const { phoneNumber, vehicleId } = req.params;

    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const vehicle = user.user_vehicle.id(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        return res.json({ success: true, data: vehicle });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// update a vehicle
const updateUserVehicle = async (req, res) => {
    const { phoneNumber, vehicleId } = req.params;
    const { make, model, variant, vehicle_reg, range, vehicle_img } = req.body;

    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const vehicle = user.user_vehicle.id(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        // Check if any of the fields are being updated
        const isUpdated = (
            vehicle.make !== make ||
            vehicle.model !== model ||
            vehicle.variant !== variant ||
            vehicle.vehicle_reg !== vehicle_reg ||
            vehicle.vehicle_img !== vehicle_img ||
            vehicle.range !== range
        );

        if (!isUpdated) {
            return res.status(400).json({ success: false, message: "All values are the same, no updates were made" });
        }

        // Update the vehicle fields
        vehicle.make = make;
        vehicle.model = model;
        vehicle.variant = variant;
        vehicle.vehicle_reg = vehicle_reg;
        vehicle.vehicle_img = vehicle_img;
        vehicle.range = range;

        await user.save();

        return res.json({ success: true, data: vehicle, message: "Vehicle updated successfully" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};


// delete a vehicle 
const deleteUserVehicle = async (req, res) => {
    const { phoneNumber, vehicleId } = req.params;

    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const vehicle = user.user_vehicle.id(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        // Check if this is the last vehicle
        if (user.user_vehicle.length === 1) {
            return res.status(400).json({ success: false, message: "User must have at least one vehicle" });
        }

        vehicle.remove();
        await user.save();

        return res.json({ success: true, message: "Vehicle deleted successfully" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// check weather user is registered or not
const checkUserRegistration = async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        const user = await User.findOne({ phoneNumber }, { password: 0 }); // Exclude password from the result

        if (user) {
            return res.json({ success: true, data: user, message: "User is registered" });
        } else {
            return res.json({ success: false, message: "User is not registered" });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};


module.exports = {
    addUser,
    getUser,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    updatepassword,
    resetpassword,
    checkUserForResetPassword,
    addUserVehicle,
    getUserVehicles,
    getUserVehicleById,
    updateUserVehicle,
    deleteUserVehicle,
    checkUserRegistration
};
