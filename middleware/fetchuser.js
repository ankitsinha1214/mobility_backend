const jwt = require('jsonwebtoken');
const JWT_SECRET = 'ankitsinha1234';

const fetchuser = (req,res,next) =>{
      // Get the user from the jwt token and add id to req object
      const token = req.header('token');
      // console.log(req.header('authorization'))
      if(!token)
      {
          res.status(401).send({error:"please authenticate using valid token"});
      }
      try {
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next();
          
      } catch (error) {
        res.status(401).send({error:"please authenticate using valid token e"});
      }
}


module.exports = fetchuser;