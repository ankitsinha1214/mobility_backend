const moment = require("moment-timezone");
const User = require("../models/userModel");
const Session = require("../models/chargerSessionModel");
const Payment = require("../models/paymentModel");

const getGraphData = async (req, res) => {
    try {
        const { filter, start, end } = req.query;
        let startDate, endDate, groupBy, timeFormat, totalPoints, differenceDays;

        if (filter === "custom") {
            if (!start || !end) {
                return res.status(400).json({ status: false, message: "Start and end dates are required for custom filter" });
            }
            const today = moment().tz("Asia/Kolkata").startOf("day");
            startDate = moment.tz(start, "Asia/Kolkata").startOf("day");
            endDate = moment.tz(end, "Asia/Kolkata").endOf("day");

            // Validation 1: Start and End should be before today
            if (startDate.isSameOrAfter(today) || endDate.isSameOrAfter(today)) {
                return res.status(400).json({ status: false, message: "Start and end dates must be before today." });
            }

            // Validation 2: Start should be less than or equal to End
            if (startDate.isAfter(endDate)) {
                return res.status(400).json({ status: false, message: "Start date cannot be after end date." });
            }
        
            const diffDays = endDate.diff(startDate, "days") + 1; // Number of days in range
            differenceDays = diffDays;
            // Define grouping based on range size
            if (diffDays <= 1) {
                groupBy = "%Y-%m-%d %H:00";
                timeFormat = "h A"; // Hourly format
                totalPoints = diffDays * 24; // Each day has 24 hours
            } else {
                groupBy = "%Y-%m-%d";
                timeFormat = "MMM D"; // Daily format
                totalPoints = diffDays;
            }
        } else if (filter === "today") {
            // startDate = moment().tz("UTC").startOf("day"); // Start of today
            startDate =  moment().tz("Asia/Kolkata").startOf("day"); 
            groupBy = "%Y-%m-%d %H:00";
            timeFormat = "h A"; // Format as "8 AM", "7 PM"
            totalPoints = moment().tz("UTC").diff(startDate, "hours") + 1; // Hours passed today
        } else if (filter === "yesterday") {
            startDate = moment().tz("Asia/Kolkata").subtract(1, "day").startOf("day"); // Start of yesterday
            // startDate = moment().tz("UTC").subtract(1, "day").startOf("day"); // Start of yesterday
            // const endDate = moment().tz("UTC").subtract(1, "day").endOf("day"); // End of yesterday
            groupBy = "%Y-%m-%d %H:00";
            timeFormat = "h A"; // Format as "8 AM", "7 PM"
            totalPoints = 24; // Full 24 hours of yesterday
        } else if (filter === "hourly") {
            startDate = moment().tz("UTC").subtract(23, "hours").startOf("hour"); // Last 24 hours
            // console.log(moment().tz("UTC"))
            groupBy = "%Y-%m-%d %H:00";
            timeFormat = "h A"; // Format as "8 AM", "7 PM"
            totalPoints = 24;
        } else if (filter === "daily") {
            startDate = moment().tz("UTC").subtract(6, "days").startOf("day"); // Last 7 days
            groupBy = "%Y-%m-%d";
            timeFormat = "MMM D"; // Format as "Mar 3", "Mar 4"
            totalPoints = 7;
        } else if (filter === "last30") {
            startDate = moment().tz("UTC").subtract(29, "days").startOf("day"); // Last 7 days
            groupBy = "%Y-%m-%d";
            timeFormat = "MMM D"; // Format as "Mar 3", "Mar 4"
            totalPoints = 30;
        } else if (filter === "weekly") {
            startDate = moment().tz("UTC").subtract(4, "weeks").startOf("isoWeek"); // Last 4 weeks
            groupBy = "%Y-%V"; // ISO week number
            timeFormat = "[Week] W"; // Format as "Week 9"
            totalPoints = 4;
        } else if (filter === "monthly") {
            startDate = moment().tz("UTC").subtract(11, "months").startOf("month"); // Last 12 months
            groupBy = "%Y-%m";
            timeFormat = "MMM YYYY"; // Format as "Mar 2025"
            totalPoints = 12;
        } else {
            return res.status(400).json({ status: false, message: "Invalid filter" });
        }

        const labels = [];
        const users = new Array(totalPoints).fill(0);
        const sessions = new Array(totalPoints).fill(0);
        const energy = new Array(totalPoints).fill(0);
        const revenue = new Array(totalPoints).fill("0.00");

        // Generate all required labels first (Converted to IST)
        const units = {
            hourly: "hours",
            today: "hours",
            yesterday: "hours",
            custom: differenceDays <=1 ? "hours" :"days",
            daily: "days",
            last30: "days",
            weekly: "weeks",
            monthly: "months",
        };

        for (let i = 0; i < totalPoints; i++) {
            const time = moment(startDate)
                .add(i, units[filter]) // Correctly maps filter to units
                .tz("Asia/Kolkata")
                .format(timeFormat);
            labels.push(time);
        }
        // for (let i = 0; i < totalPoints; i++) {
        //     const time = moment(startDate)
        //         .add(i, filter === "hourly" ? "hours" : filter)
        //         .tz("Asia/Kolkata")
        //         .format(timeFormat);
        //     labels.push(time);
        // }
        let userData, sessionData, energyData, revenueData;
        // Fetch Data
        if(filter === "custom"){
            userData = await User.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, count: { $sum: 1 } } }
            ]);
    
    
            sessionData = await Session.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, count: { $sum: 1 } } }
            ]);
    
            // const energyData = await Session.aggregate([
            //     { $match: { createdAt: { $gte: startDate.toDate() } } },
            //     { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, total: { $sum: "$meta.energyConsumed" } } }
            // ]);
            energyData = await Session.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
    
                // Extract Energy Values Properly
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        energyValues: {
                            $map: {
                                input: "$metadata",
                                as: "data",
                                in: {
                                    $let: {
                                        vars: {
                                            energyString: {
                                                $getField: { field: "Energy.Active.Import.Register", input: "$$data.values" }
                                            }
                                        },
                                        in: {
                                            $toDouble: {
                                                $arrayElemAt: [
                                                    { $split: ["$$energyString", " "] },
                                                    0
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
    
                // Extract First and Last Energy Values and Fix Precision
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        firstEnergy: { $arrayElemAt: ["$energyValues", 0] },
                        lastEnergy: {
                            $arrayElemAt: ["$energyValues", { $subtract: [{ $size: "$energyValues" }, 1] }]
                        },
                        energyConsumed: {
                            $round: [
                                {
                                    $subtract: [
                                        { $arrayElemAt: ["$energyValues", { $subtract: [{ $size: "$energyValues" }, 1] }] },
                                        { $arrayElemAt: ["$energyValues", 0] }
                                    ]
                                },
                                3  // ✅ Fixing to 3 decimal places
                            ]
                        }
                    }
                },
                // 🚀 **Group by time intervals (hourly, daily, etc.)**
                {
                    $group: {
                        _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, // Fix: Group by formatted timestamp
                        total: { $sum: "$energyConsumed" }
                    }
                }
            ]);
            // ✅ Debug Output
            // console.log("DEBUGGING ENERGY DATA:", JSON.stringify(energyData, null, 2));
    
             revenueData = await Payment.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, total: { $sum: "$amount" } } }
            ]);
        }
        else{
        userData = await User.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate() } } },
                { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, count: { $sum: 1 } } }
            ]);
    
    
        sessionData = await Session.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate() } } },
                { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, count: { $sum: 1 } } }
            ]);
    
            // const energyData = await Session.aggregate([
            //     { $match: { createdAt: { $gte: startDate.toDate() } } },
            //     { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, total: { $sum: "$meta.energyConsumed" } } }
            // ]);
        energyData = await Session.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate() } } },
    
                // Extract Energy Values Properly
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        energyValues: {
                            $map: {
                                input: "$metadata",
                                as: "data",
                                in: {
                                    $let: {
                                        vars: {
                                            energyString: {
                                                $getField: { field: "Energy.Active.Import.Register", input: "$$data.values" }
                                            }
                                        },
                                        in: {
                                            $toDouble: {
                                                $arrayElemAt: [
                                                    { $split: ["$$energyString", " "] },
                                                    0
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
    
                // Extract First and Last Energy Values and Fix Precision
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        firstEnergy: { $arrayElemAt: ["$energyValues", 0] },
                        lastEnergy: {
                            $arrayElemAt: ["$energyValues", { $subtract: [{ $size: "$energyValues" }, 1] }]
                        },
                        energyConsumed: {
                            $round: [
                                {
                                    $subtract: [
                                        { $arrayElemAt: ["$energyValues", { $subtract: [{ $size: "$energyValues" }, 1] }] },
                                        { $arrayElemAt: ["$energyValues", 0] }
                                    ]
                                },
                                3  // ✅ Fixing to 3 decimal places
                            ]
                        }
                    }
                },
                // 🚀 **Group by time intervals (hourly, daily, etc.)**
                {
                    $group: {
                        _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, // Fix: Group by formatted timestamp
                        total: { $sum: "$energyConsumed" }
                    }
                }
            ]);
            // ✅ Debug Output
            // console.log("DEBUGGING ENERGY DATA:", JSON.stringify(energyData, null, 2));
    
        revenueData = await Payment.aggregate([
                { $match: { createdAt: { $gte: startDate.toDate() } } },
                { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, total: { $sum: "$amount" } } }
            ]);
        }

        // console.log(revenueData)
        // **Fix: Convert Data to IST before Mapping**
        // const convertToIST = (utcTime) => {
        //     return moment.utc(utcTime, groupBy).tz("Asia/Kolkata").format(timeFormat);
        // };
        // const convertToIST = (utcString) => {
        //     return moment.utc(utcString, "YYYY-MM-DD").tz("Asia/Kolkata").format(timeFormat);
        // };
        const convertToIST = (utcString, filter) => {
            let utcDate;

            // Adjust parsing format based on filter
            if (filter === "hourly") {
                utcDate = moment.utc(utcString, "YYYY-MM-DD HH:00").toDate();
            }
            else if (filter === "today") {
                utcDate = moment.utc(utcString, "YYYY-MM-DD HH:00").toDate();
            }
            else if (filter === "yesterday") {
                utcDate = moment.utc(utcString, "YYYY-MM-DD HH:00").toDate();
            }
            else if (filter === "custom") {
                utcDate = moment.utc(utcString, "YYYY-MM-DD HH:00").toDate();
            }
             else if (filter === "daily") {
                utcDate = moment.utc(utcString, "YYYY-MM-DD").toDate();
            } else if (filter === "last30") {
                utcDate = moment.utc(utcString, "YYYY-MM-DD").toDate();
            } else if (filter === "weekly") {
                utcDate = moment.utc(utcString, "YYYY-WW").startOf("isoWeek").toDate();
            } else if (filter === "monthly") {
                utcDate = moment.utc(utcString, "YYYY-MM").startOf("month").toDate();
            } else {
                return utcString; // Fallback for unknown filters
            }

            return moment(utcDate).tz("Asia/Kolkata").format(timeFormat);
        };


        // Map Data
        userData.forEach(d => {
            const index = labels.indexOf(convertToIST(d._id, filter));
            if (index !== -1) users[index] = d.count;
        });

        sessionData.forEach(d => {
            const index = labels.indexOf(convertToIST(d._id, filter));
            if (index !== -1) sessions[index] = d.count;
        });

        energyData.forEach(d => {
            const index = labels.indexOf(convertToIST(d._id, filter));
            // console.log(index)
            if (index !== -1)
                // energy[index] = d.energyConsumed;
            energy[index] = d.total;
        });

        revenueData.forEach(d => {
            const index = labels.indexOf(convertToIST(d._id, filter));
            // console.log(index)
            if (index !== -1) revenue[index] = (d.total / 100).toFixed(2);
        });

        return res.json({
            status: true,
            message: "Data retrieved successfully.",
            data: { 
                labels, 
                users, 
                sessions, 
                energy, 
                revenue,
                total: {
                    users: users.reduce((sum, val) => sum + val, 0),
                    sessions: sessions.reduce((sum, val) => sum + val, 0),
                    energy: energy.reduce((sum, val) => sum + val, 0).toFixed(3), // Fix precision to 3 decimal places
                    revenue: revenue.reduce((sum, val) => sum + parseFloat(val), 0).toFixed(2) // Convert strings to numbers
                }
             }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getGraphData
};