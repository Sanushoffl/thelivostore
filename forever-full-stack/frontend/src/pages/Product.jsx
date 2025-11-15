import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';
import { toast } from 'react-toastify';

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart, backendUrl, token } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [activeTab, setActiveTab] = useState('description')
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  })

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })

  }

  const fetchReviews = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/review/get', { productId })
      if (response.data.success) {
        setReviews(response.data.reviews)
        // Calculate average rating
        if (response.data.reviews.length > 0) {
          const avg = response.data.reviews.reduce((sum, review) => sum + review.rating, 0) / response.data.reviews.length
          setAverageRating(avg)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  useEffect(() => {
    fetchProductData();
    fetchReviews();
  }, [productId, products])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!token) {
      toast.error('Please login to submit a review')
      return
    }

    try {
      const response = await axios.post(backendUrl + '/api/review/add', {
        productId,
        rating: reviewData.rating,
        comment: reviewData.comment
      }, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setReviewData({ rating: 5, comment: '' })
        setShowReviewForm(false)
        fetchReviews() // Refresh reviews
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <img
          key={i}
          src={i <= rating ? assets.star_icon : assets.star_dull_icon}
          alt=""
          className="w-3 h-3"
        />
      )
    }
    return stars
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item,index)=>(
                  <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                ))
              }
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className=' flex items-center gap-1 mt-2'>
              {renderStars(Math.round(averageRating))}
              <p className='pl-2'>({reviews.length})</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item,index)=>(
                  <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                ))}
              </div>
          </div>
          {productData.stockStatus === 'in stock' ? (
            <button onClick={()=>addToCart(productData._id,size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>BUY NOW</button>
          ) : productData.stockStatus === 'out of stock' ? (
            <button disabled className='bg-red-500 text-white px-8 py-3 text-sm cursor-not-allowed opacity-75'>OUT OF STOCK</button>
          ) : (
            <button disabled className='bg-gray-400 text-white px-8 py-3 text-sm cursor-not-allowed opacity-75'>COMING SOON!</button>
          )}
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <button
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'bg-gray-100 font-semibold' : ''}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'bg-gray-100 font-semibold' : ''}`}
          >
            Reviews ({reviews.length})
          </button>
        </div>
        
        {activeTab === 'description' ? (
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
            <p>{productData.description}</p>
            <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
            <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
          </div>
        ) : (
          <div className='border px-6 py-6'>
            {/* Add Review Button */}
            {token && (
              <div className='mb-6'>
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className='bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800'
                  >
                    Write a Review
                  </button>
                ) : (
                  <form onSubmit={handleSubmitReview} className='border p-4 rounded'>
                    <h3 className='font-semibold mb-4'>Write a Review</h3>
                    <div className='mb-4'>
                      <label className='block text-sm font-medium mb-2'>Rating</label>
                      <div className='flex gap-2'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className='focus:outline-none'
                          >
                            <img
                              src={star <= reviewData.rating ? assets.star_icon : assets.star_dull_icon}
                              alt=""
                              className="w-6 h-6 cursor-pointer"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className='mb-4'>
                      <label className='block text-sm font-medium mb-2'>Comment</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        required
                        rows="4"
                        className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black'
                        placeholder='Write your review here...'
                      />
                    </div>
                    <div className='flex gap-2'>
                      <button
                        type="submit"
                        className='bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800'
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false)
                          setReviewData({ rating: 5, comment: '' })
                        }}
                        className='bg-gray-200 text-gray-800 px-6 py-2 text-sm rounded hover:bg-gray-300'
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className='text-gray-500 text-center py-8'>No reviews yet. Be the first to review this product!</p>
            ) : (
              <div className='flex flex-col gap-6'>
                {reviews.map((review, index) => (
                  <div key={index} className='border-b pb-4 last:border-b-0'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='flex items-center gap-1'>
                        {renderStars(review.rating)}
                      </div>
                      <p className='font-semibold text-sm'>{review.userName}</p>
                      <p className='text-xs text-gray-500'>
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className='text-gray-700 text-sm'>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product
