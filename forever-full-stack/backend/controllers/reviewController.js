import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

// Get reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }

        const reviews = await reviewModel.find({ productId }).sort({ date: -1 });

        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.json({ success: false, message: error.message });
    }
}

// Add a review
const addReview = async (req, res) => {
    try {
        const { userId, productId, rating, comment } = req.body;

        if (!userId || !productId || !rating || !comment) {
            return res.json({ success: false, message: "All fields are required" });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // Get user info
        const user = await userModel.findById(userId).select('name email');
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if user already reviewed this product
        const existingReview = await reviewModel.findOne({ userId, productId });
        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.date = Date.now();
            await existingReview.save();
            return res.json({ success: true, message: "Review updated successfully", review: existingReview });
        }

        // Create new review
        const newReview = new reviewModel({
            productId,
            userId,
            userName: user.name,
            userEmail: user.email,
            rating,
            comment,
            date: Date.now()
        });

        await newReview.save();

        res.json({ success: true, message: "Review added successfully", review: newReview });
    } catch (error) {
        console.error("Error adding review:", error);
        res.json({ success: false, message: error.message });
    }
}

export { getProductReviews, addReview }

