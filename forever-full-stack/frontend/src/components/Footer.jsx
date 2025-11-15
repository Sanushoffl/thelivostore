import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
            LIVO is the embodiment of modern luxury and subtle sophistication. We believe true style is timeless, and our pieces are designed to be the foundation of a confidently curated wardrobe. Style, Simplified.
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>
                  <Link to='/' className='hover:text-black transition'>Home</Link>
                </li>
                <li>
                  <Link to='/about' className='hover:text-black transition'>About us</Link>
                </li>
                <li>
                  <Link to='/delivery' className='hover:text-black transition'>Delivery</Link>
                </li>
                <li>
                  <Link to='/privacy-policy' className='hover:text-black transition'>Privacy policy</Link>
                </li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>We aim to respond within 24 hours.</li>
                <li>contact@livo.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2025@ livo.shop - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
