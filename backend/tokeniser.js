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