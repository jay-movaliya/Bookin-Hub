import jwt from 'jsonwebtoken';
import { ApiResponse } from "../../utils/apiResponse.js";

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json(new ApiResponse(401, null, "Access Denied: No Token Provided"));
  }

  // Verify token and set user data to req.user
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json(new ApiResponse(403, null, "Access Denied: Invalid Token"));
    }
    req.user = user; // Set decoded user data in the request object
    next();
  });
}

export default authenticateUser;
