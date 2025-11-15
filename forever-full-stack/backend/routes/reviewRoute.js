import express from 'express';
import { getProductReviews, addReview } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';

const reviewRouter = express.Router();

reviewRouter.post('/get', getProductReviews);
reviewRouter.post('/add', authUser, addReview);

export default reviewRouter;

