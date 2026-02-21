import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../tokeniser.js";

async function signup(req, res) {

  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = generateToken(user) ;
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "strict",
        });
    res.status(201).json({ message: "User created successfully",success :true  });
  } catch (error) {
    
    res.status(500).json({ message: "Error creating user", error ,success :false });
    throw error;
  }
}

async function login(req, res) {
  try {    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" ,success :false });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials", success :false });
      } else {
        const token = generateToken(user) ;
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "strict",
        });
        res.status(200).json({ message: "Login successful", success :true });
      } 
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error,success :false  });
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success :false });
    }
    res.status(200).json({ user, success :true });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error, success :false });
  } 
}


async function logout(req, res) {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful", success :true });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error, success :false });
  }
}


export { signup ,login,me,logout};
