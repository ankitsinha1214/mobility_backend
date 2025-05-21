const authorizeAccess = (requiredServiceId) => {
    return (req, res, next) => {
      const { role, serviceID } = req.SandmUser;
        console.log('user->',req.SandmUser);
      if (role === 'Admin') {
        return next(); // full access
      }
  
      if (role === 'Manager' && serviceID.includes(requiredServiceId)) {
        return next(); // access granted
      }
  
      return res.status(403).json({
        status: false,
        message: "Access denied: You do not have permission to access this module.",
      });
    };
  };
  
  module.exports = authorizeAccess;
  