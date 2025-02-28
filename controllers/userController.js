// userController.js

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const ChargerLocation = require('../models/chargerLocationModel');
const { USER } = require("../message.json");
const { generateToken } = require('../utils/jwtUtil');
const ChargingSession = require('../models/chargerSessionModel.js');
const Payment = require('../models/paymentModel');

// Update user password
// const updatepassword = async (req, res) => {
//     const { username, oldpassword, newpassword } = req.body;

//     if (!oldpassword || !newpassword) {
//         return res.json({ success: false, message: "Old password or new password cannot be empty" });
//     }

//     try {
//         const user = await User.findOne({ username });

//         if (user) {
//             const passwordMatch = await bcrypt.compare(oldpassword, user.password);

//             if (!passwordMatch) {
//                 return res.status(401).json({ success: false, message: 'Old password is incorrect' });
//             }

//             if (oldpassword === newpassword) {
//                 return res.status(401).json({ success: false, message: 'Old and new password cannot be the same' });
//             }

//             const hashedPassword = await bcrypt.hash(newpassword, 10);
//             user.password = hashedPassword;
//             await user.save();

//             return res.json({ success: true, message: "Password updated successfully" });
//         } else {
//             return res.json({ success: false, message: "User not found" });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'An error occurred' });
//     }
// };

// Check user for password reset
// const checkUserForResetPassword = async (req, res) => {
//     const { username, phoneNumberLast4Digits } = req.body;

//     if (!username || !phoneNumberLast4Digits) {
//         return res.json({ success: false, message: "Username and last 4 digits of phone number are required" });
//     }

//     try {
//         const user = await User.findOne({ username });

//         if (user) {
//             const userPhoneNumberLast4Digits = user.phoneNumber.slice(-4);

//             if (userPhoneNumberLast4Digits === phoneNumberLast4Digits) {
//                 return res.json({ success: true, message: "User exists and phone number digits match" });
//             } else {
//                 return res.json({ success: false, message: "Last 4 digits of phone number do not match" });
//             }
//         } else {
//             return res.json({ success: false, message: "User not found" });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'An error occurred' });
//     }
// };

// Reset user password
// const resetpassword = async (req, res) => {
//     const { username, newpassword } = req.body;

//     if (!username || !newpassword) {
//         return res.json({ success: false, message: "Username or new password cannot be empty" });
//     }

//     try {
//         const user = await User.findOne({ username });

//         if (user) {
//             const hashedPassword = await bcrypt.hash(newpassword, 10);
//             user.password = hashedPassword;
//             await user.save();

//             return res.json({ success: true, message: "Password reset successfully" });
//         } else {
//             return res.json({ success: false, message: "User not found" });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'An error occurred' });
//     }
// };

// User login
// const loginUser = async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const user = await User.findOne({ username });

//         if (!user) {
//             return res.status(401).json({ success: false, message: 'Authentication failed' });
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (passwordMatch) {
//             const userDataToSend = {
//                 id: user.id,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 phoneNumber: user.phoneNumber,
//                 username: user.username,
//                 avatar: user.avatar,
//                 createdAt: user.createdAt,
//                 updatedAt: user.updatedAt,
//             };

//             return res.status(200).json({ success: true, data: userDataToSend });
//         } else {
//             return res.status(401).json({ success: false, message: 'Authentication failed' });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'An error occurred' });
//     }
// };

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
        // prev code
        // const newUser = new User(req.body);
        // await newUser.save();


        // Remove _id from each vehicle object in user_vehicle array
        const cleanedUserVehicle = user_vehicle.map(vehicle => {
            const { _id, ...cleanedVehicle } = vehicle;
            return cleanedVehicle;
        });
        // Prepare user data, including cleaned user_vehicle
        const { _id: ignoredId, user_vehicle: _, ...userData } = req.body;
        userData.user_vehicle = cleanedUserVehicle;

        const newUser = new User(userData);
        await newUser.save();

        const userDataToSend = {
            id: newUser._id,
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
        const userId = {
            _id: newUser._id,
            phoneNumber: newUser.phoneNumber
        };
        // console.log(userId);
        const { token } = generateToken(userId);
        // const { token } = generateToken(userId);
        // const decodedToken = jwt.decode(token); // Decode the token to get iat
        // const iat = decodedToken.iat;
        // Get the current time in seconds (this represents 'iat')
        const iat = Math.floor(Date.now() / 1000);  // Convert to seconds
        console.log(iat);
        await User.findByIdAndUpdate(newUser._id, { tokenIat: iat });

        return res.json({
            success: true, data: userDataToSend, message: USER.USER_CREATED,
            token: token,
            sessionId: null,
            startTime: null,
            chargerId: null,
            status: "No active session"
        });
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
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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

// get user based on pagination option for optimized rendering
const getPaginatedUser = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are not authorized to view this data." });
        }

        // Extract pagination, sorting, and filtering parameters from the query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const search = req.query.search || '';

        // Define the fields to return in the response
        const userFields = 'firstName lastName phoneNumber email state city gender dob user_vehicle status profilePic';

        // Build filter condition for searching
        // Build filter condition for searching across multiple fields
        let filterCondition = {};
        if (search) {
            filterCondition = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    // { email: { $regex: search, $options: 'i' } },
                    { gender: { $regex: search, $options: 'i' } },
                    { state: { $regex: search, $options: 'i' } },
                    { city: { $regex: search, $options: 'i' } },
                    // { 'phoneNumber.number': { $regex: search, $options: 'i' } }, // Adjust for nested fields
                ],
            };
        }
        // Log the filter condition for debugging
        console.log("Filter condition:", JSON.stringify(filterCondition));

        // Fetch users with pagination, sorting, and filtering applied
        const users = await User.find(filterCondition, userFields)
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        // Fetch the total count for pagination metadata
        const totalCount = await User.countDocuments(filterCondition);

        // Add an additional condition for counting active users with the same filter conditions
        const activeFilterCondition = {
            ...filterCondition,
            status: 'active'
        };
        const totalActiveCount = await User.countDocuments(activeFilterCondition);

        // Count users by vehicle type
        const vehicleCounts = await User.aggregate([
            { $match: filterCondition }, // Apply the filter condition
            { $unwind: "$user_vehicle" }, // Unwind the user_vehicle array
            {
                $group: {
                    _id: "$user_vehicle.type", // Group by the 'type' field in user_vehicle
                    count: { $sum: 1 },
                },
            },
        ]);
        console.log(vehicleCounts);

        // Format the vehicle counts for response
        const vehicleTypeCounts = {
            "2-Wheeler": 0,
            "3-Wheeler": 0,
            "4-Wheeler": 0,
        };

        // Populate the counts dynamically
        vehicleCounts.forEach(vehicle => {
            vehicleTypeCounts[vehicle._id] = vehicle.count || 0;
        });
        // Return paginated results along with total count for frontend table management
        return res.json({
            success: true,
            data: users,
            pagination: {
                totalRecords: totalCount,
                totalActiveRecords: totalActiveCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
            },
            vehicleCounts: vehicleTypeCounts,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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
    const { 
        // gender, 
        email,
        //  date_of_birth,
         ...updateFields } = req.body;
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    // Check if restricted fields are in the request body
    // if (gender || email || date_of_birth) {
    if ( email) {
        return res.json({
            success: false,
            message: "Updating Email is not allowed"
            // message: "Updating gender, email, or date of birth is not allowed"
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
    if (!phoneNumber) {
        return res.json({ status: false, message: 'Phone Number is required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    try {
        // **Check for Active Session for User**
        const activeUserSession = await ChargingSession.findOne({
            userPhone: phoneNumber,
            // status: 'Started'
            status: { $in: ['Started', 'Stopped'] }
        });
        if (activeUserSession) {
            return res.json({
                success: false,
                message: 'User cannot be deleted due to an ongoing transaction or session.'
            });
        }
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
            updatedUser.status = "Inactive";
            // Update the user document
            await User.findByIdAndUpdate(user._id, updatedUser, { new: true });

            return res.json({ success: true, message: USER.USER_DELETED });
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
    const { type, make, model, variant, vehicle_reg, range, vehicle_img } = req.body;
    if (!phoneNumber) {
        return res.json({ status: false, message: 'Phone Number is required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
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

        // const existingVehicle = await User.findOne({
        //     phoneNumber,
        //     'user_vehicle.make': make,
        //     'user_vehicle.model': model,
        //     'user_vehicle.variant': variant
        // });

        // Check if the vehicle with the same make, model, and variant already exists
        const existingVehicle = await User.findOne({
            phoneNumber,
            'user_vehicle': {
                $elemMatch: {
                    make,
                    model,
                    variant
                }
            }
        });
        // console.log(existingVehicle);

        if (existingVehicle) {
            return res.status(400).json({ success: false, message: 'Vehicle with the same make, model, and variant already exists for this user' });
        }

        // Create a new vehicle object
        const newVehicle = { type, make, model, variant, vehicle_reg, range, vehicle_img };

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
    if (!phoneNumber) {
        return res.json({ status: false, message: 'Phone Number is required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
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
    if (!phoneNumber) {
        return res.json({ status: false, message: 'Phone Number is required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
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
    const { type, make, model, variant, vehicle_reg, range, vehicle_img } = req.body;
    if (!phoneNumber) {
        return res.json({ status: false, message: 'Phone Number is required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }

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
            vehicle.type !== type ||
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
        vehicle.type = type;
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
    if (!phoneNumber) {
        return res.json({ status: false, message: 'Phone Number is required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Find the vehicle by ID
        const vehicleIndex = user.user_vehicle.findIndex(vehicle => vehicle._id.toString() === vehicleId);

        if (vehicleIndex === -1) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        // Check if this is the last vehicle
        if (user.user_vehicle.length === 1) {
            return res.status(400).json({ success: false, message: "User must have at least one vehicle" });
        }

        // Remove the vehicle from the array
        user.user_vehicle.splice(vehicleIndex, 1);


        // const vehicle = user.user_vehicle.id(vehicleId);
        // if (!vehicle) {
        //     return res.status(404).json({ success: false, message: "Vehicle not found" });
        // }

        // // Check if this is the last vehicle
        // if (user.user_vehicle.length === 1) {
        //     return res.status(400).json({ success: false, message: "User must have at least one vehicle" });
        // }
        // vehicle.remove();
        await user.save();

        return res.json({ success: true, message: "Vehicle deleted successfully" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// GET History of session of user by phone number 
const getHistory = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Validate phoneNumber input
        if (!phoneNumber) {
            return res.json({
                status: false,
                message: 'Phone number is required',
            });
        }
        // Find all sessions associated with the phoneNumber
        const sessions = await ChargingSession.find({ userPhone: phoneNumber })
            .sort({ startTime: -1 }) // Sort by most recent sessions
            .select('-__v'); // Exclude the __v field if not needed

        if (!sessions || sessions.length === 0) {
            return res.json({
                status: false,
                message: 'No charging sessions found for this phone number',
            });
        }
        // console.log(sessions);
        const chargerLocations = await Promise.all(
            sessions.map(async (session) => {
                return ChargerLocation.findOne({
                    'chargerInfo.name': session.chargerId,
                }).select('locationName locationType freepaid chargerInfo address');
            })
        );
        // Filter out null results
        const validLocations = chargerLocations.filter(location => location !== null);

        if (validLocations.length === 0) {
            return res.json({ status: false, message: 'Charger locations not found.' });
        }

        const results = await Promise.all(
            validLocations.map(async (location, index) => {
                const chargerInfo = location.chargerInfo.find(
                    charger => charger.name === sessions[index].chargerId
                );

                if (!chargerInfo) {
                    return null;
                }

                const session = sessions[index];
                const metadata = session.metadata || [];
                // Get the 0th index and the highest index
                const firstEntry = metadata[0]?.values;
                const lastEntry = metadata[metadata.length - 1]?.values;
                // Extract meter values and units
                const firstMeterValueParts = firstEntry['Energy.Active.Import.Register']?.split(' ') || [];

                // Extract meter values
                const firstMeterValue = parseFloat(firstEntry['Energy.Active.Import.Register']?.split(' ')[0] || 0);
                const lastMeterValue = parseFloat(lastEntry['Energy.Active.Import.Register']?.split(' ')[0] || 0);

                // Extract the unit (assuming both entries have the same unit)
                const unit = firstMeterValueParts[1] || 'Wh';
                // Calculate the difference
                const meterValueDifference = `${(lastMeterValue - firstMeterValue).toFixed(4)} ${unit}`;

                const durationInMs = session.endTime - session.startTime;
                const durationInSeconds = Math.floor(durationInMs / 1000);
                const hours = Math.floor(durationInSeconds / 3600).toString().padStart(2, '0');
                const minutes = Math.floor((durationInSeconds % 3600) / 60).toString().padStart(2, '0');
                const seconds = (durationInSeconds % 60).toString().padStart(2, '0');
                const formattedDuration = `${hours}:${minutes}:${seconds}`;

                // Fetch payment details for the session
                const payment = await Payment.findOne({ sessionId: session._id }).select('method amount status id');
                const user = await User.findOne({ phoneNumber, status: 'active' }).populate('user_vehicle');

                if (!user) {
                    return res.json({
                        status: false,
                        message: 'User not found or not active'
                    });
                }
                // Validate Vehicle
                // console.log(user);
                const userVehicle = user.user_vehicle?.find(vehicle => vehicle._id.toString() === session?.vehicleId.toString());
                // console.log('user vehicle', userVehicle);
                // if (!userVehicle) {
                //     return res.json({ status: false, message: 'Vehicle not associated with the user' });
                // }
                return {
                    locationName: location.locationName,
                    address: location.address,
                    createdAt: session.createdAt,
                    status: session.status,
                    chargerName: session.chargerId,
                    transactionId: payment?.id,
                    EnergyConsumed: meterValueDifference,
                    chargerType: chargerInfo.type,
                    powerOutput: chargerInfo.powerOutput,
                    chargeTime: formattedDuration,
                    vehicle: `${userVehicle?.make} ${userVehicle?.model} ${userVehicle?.variant}` || 'N/A',
                    paymentMethod: payment?.method || 'N/A',
                    paymentAmount: payment?.amount ? `₹ ${(payment.amount / 100).toFixed(2)} /-` : 'N/A',
                    paymentStatus: payment?.status || 'N/A',
                };
            })
        );

        // Remove null entries
        const infoData = results.filter(result => result !== null);

        if (infoData.length === 0) {
            return res.json({
                status: false,
                message: 'Charger details not found in any location',
            });
        }

        res.json({
            status: true,
            message: 'Charging session history retrieved successfully',
            data: infoData,
        });
    } catch (error) {
        console.error('Error fetching charging sessions:', error);
        res.status(500).json({
            status: false,
            message: 'Internal server error',
        });
    }
};

// check weather user is registered or not
const checkUserRegistration = async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        const user = await User.findOne({ phoneNumber }, { password: 0 }); // Exclude password from the result

        if (user) {
            const userId = {
                _id: user._id,
                // _id : user._id.toString(),
                phoneNumber: user.phoneNumber
            };
            // console.log(userId);
            const { token } = generateToken(userId);
            // const decodedToken = jwt.decode(token); // Decode the token to get iat
            // const iat = decodedToken.iat;
            // Get the current time in seconds (this represents 'iat')
            const iat = Math.floor(Date.now() / 1000);  // Convert to seconds
            console.log(iat);
            // const { token, iat } = generateToken(userId);
            await User.findByIdAndUpdate(user._id, { tokenIat: iat });

            // Find the most recent charging session for this user (latest createdAt)
            const session = await ChargingSession.findOne({ userPhone: phoneNumber })
                .sort({ createdAt: -1 }) // Sort descending (latest first)
                .limit(1); // Get only the most recent session

            const chargerLocation = await ChargerLocation.findOne({ 'chargerInfo.name': session?.chargerId }).select('_id');
            // console.log(chargerLocation)
            return res.json({
                success: true,
                data: user,
                message: "User is registered",
                token: token,
                sessionId: session ? session._id : null,
                locationId: chargerLocation ? chargerLocation._id : null,
                startTime: session ? session.startTime : null,
                chargerId: session ? session.chargerId : null,
                status: session ? session.status : "No active session"
            });

        } else {
            return res.json({ success: false, message: "User is not registered" });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// add location to favourite
const addFavouriteLocation = async (req, res) => {
    const { phoneNumber } = req.params;
    const { locationId } = req.body;

    if (!phoneNumber || !locationId) {
        return res.json({ status: false, message: 'Phone Number and Location ID are required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    try {
        // Check if the location exists
        const location = await ChargerLocation.findById(locationId);
        if (!location) {
            return res.json({ status: false, message: 'Location not found' });
        }

        // Find the user by phone number
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        // Add the location ID to the array if it doesn't already exist
        if (!user.user_favourite_charger_locations.includes(locationId)) {
            user.user_favourite_charger_locations.push(locationId);
            await user.save();
        }

        res.json({ status: true, message: 'Location added to favourites', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};

const getUserFavouriteLocations = async (req, res) => {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
        return res.json({ status: false, message: 'Phone Number is required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    try {
        // Find the user by phone number
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        // Get the detailed information for each favorite location
        const favouriteLocations = await ChargerLocation.find({
            _id: { $in: user.user_favourite_charger_locations }
        });

        res.json({ status: true, message: 'Favourite locations retrieved successfully', data: favouriteLocations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};

const removeFavouriteLocation = async (req, res) => {
    const { phoneNumber } = req.params;
    const { locationId } = req.body;

    if (!phoneNumber || !locationId) {
        return res.json({ status: false, message: 'Phone Number and Location ID are required' });
    }
    if (req.phn && phoneNumber !== req.phn) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    if (req.user && req.user === 'User') {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    try {
        // Check if the location ID exists
        const locationExists = await ChargerLocation.findById(locationId);
        if (!locationExists) {
            return res.json({ status: false, message: 'Location ID not found' });
        }

        // Find the user by phone number
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        // Check if the location ID is in the user's favorites
        const index = user.user_favourite_charger_locations.indexOf(locationId);
        if (index > -1) {
            // Remove the location ID from the user's favorites list
            user.user_favourite_charger_locations.splice(index, 1);
            await user.save();
            return res.json({ status: true, message: 'Location removed from favourites', user });
        } else {
            return res.json({ status: false, message: 'Location ID not found in user\'s favourites' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};

module.exports = {
    addUser,
    getUser,
    getPaginatedUser,
    getUserById,
    updateUser,
    deleteUser,
    // loginUser,
    // updatepassword,
    // resetpassword,
    // checkUserForResetPassword,
    addUserVehicle,
    getUserVehicles,
    getUserVehicleById,
    getHistory,
    updateUserVehicle,
    deleteUserVehicle,
    checkUserRegistration,
    addFavouriteLocation,
    getUserFavouriteLocations,
    removeFavouriteLocation
};
