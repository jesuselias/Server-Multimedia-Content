const jwt = require('jsonwebtoken');


// Define role object
const role = {
  ADMIN: 'admin',
  CREATOR: 'Creador',
  READER: 'Lector'
};

function authenticateToken(req, res, next) {
    const token = req.header('authorization').replace('Bearer ', '');
  
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);

      console.log("user",user)
      console.log("user.role",user.role)

      console.log("user.role",user.role)
      
      if (!user.role) {
        return res.status(500).json({ message: 'No role found in token' });
      }
      
      req.user = user;
      next();
    });
  };


  function authorize(role) {
    return function(req, res, next) {
      console.log("User:", req.user);
      console.log("role:", req.user.role || []);
  
      if (!req.user) return res.status(401).json({ message: 'Unauthorized: No user found' });
  
      if (!Array.isArray(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
  
      if (!role.some(role => req.user.role.includes(role))) {
        return res.status(403).json({ message: 'Forbidden: User does not have required permissions' });
      }
  
      next();
    };
  }
  

module.exports = { authenticateToken, authorize, role };
