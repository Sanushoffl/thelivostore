import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary"


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body
        
        const user = await userModel.findById(userId).select('-password -cartData')
        
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        // Get userId from req.userId (set by auth middleware) or req.body as fallback
        const userId = req.userId || req.body.userId
        
        if (!userId) {
            console.error("UserId not found in request")
            return res.json({ success: false, message: "User ID not found. Please login again." })
        }
        
        console.log("Updating profile for userId:", userId)
        
        // Get name and email from req.body (FormData sends these as strings)
        const name = req.body.name
        const email = req.body.email
        
        console.log("Received data:", { name, email, hasFile: !!req.file })
        
        // Get current user data
        const currentUser = await userModel.findById(userId)
        if (!currentUser) {
            console.error("User not found with ID:", userId)
            return res.json({ success: false, message: "User not found" })
        }
        
        const updateData = {}
        
        // Update name only if provided and different
        if (name !== undefined && name !== null && name.trim() !== '' && name.trim() !== currentUser.name) {
            updateData.name = name.trim()
        }
        
        // Update email only if provided and different
        if (email !== undefined && email !== null && email.trim() !== '') {
            const trimmedEmail = email.trim()
            
            // Only validate and update email if it's different from current email
            if (trimmedEmail !== currentUser.email) {
                // Validate email format
                if (!validator.isEmail(trimmedEmail)) {
                    return res.json({ success: false, message: "Please enter a valid email" })
                }
                
                // Check if email is already taken by another user
                const existingUser = await userModel.findOne({ email: trimmedEmail, _id: { $ne: userId } })
                if (existingUser) {
                    return res.json({ success: false, message: "Email already in use" })
                }
                
                updateData.email = trimmedEmail
            }
        }
        
        // Handle profile image upload (only if file is provided)
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
                updateData.profileImage = result.secure_url
            } catch (uploadError) {
                console.error("Image upload error:", uploadError)
                return res.json({ success: false, message: "Failed to upload image" })
            }
        }
        
        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.json({ success: false, message: "No changes to update" })
        }
        
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password -cartData')
        
        res.json({ success: true, message: "Profile updated successfully", user: updatedUser })
    } catch (error) {
        console.error("Update profile error:", error)
        res.json({ success: false, message: error.message || "Failed to update profile" })
    }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile }