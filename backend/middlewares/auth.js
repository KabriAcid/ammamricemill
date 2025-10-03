import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants.js";

export function authenticateToken(req, res, next) {
  console.log("Auth Debug - Cookies:", req.cookies);
  console.log("Auth Debug - Headers:", req.headers);
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  console.log("Auth Debug - Extracted Token:", token);
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Auth Debug - Token Verification Error:", err);
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}
