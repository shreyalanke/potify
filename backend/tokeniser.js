import jwt from "jsonwebtoken";
import envConfig from "./config/index.js";

const secret = envConfig.SECRET ;


export function generateToken(user) {
    console.log("Secret:", secret);
    return jwt.sign({ id: user._id }, secret, { expiresIn: "24h" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}

export function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "No token provided", success :false });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Invalid token", success :false });
    }
    req.user = decoded
    next();
}
