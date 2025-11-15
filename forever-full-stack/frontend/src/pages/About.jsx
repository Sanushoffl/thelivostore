import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p>LIVO was born out of a passion for modern elegance and a desire to simplify the way people approach refined dressing. Our journey began with a simple idea: to provide a curated platform where customers could easily discover, explore, and purchase high-quality, timeless fashion essentials from the comfort of their homes. Since our inception, we've worked tirelessly to curate a selective range of clothing and accessories that cater to every taste for polished, subtle luxury. We offer an exclusive collection sourced from trusted designers and suppliers who share our commitment to impeccable craftsmanship and lasting style.</p>
              <p>Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. From fashion and beauty to electronics and home essentials, we offer an extensive collection sourced from trusted brands and suppliers.</p>
              <b className='text-gray-800'>Our Mission</b>
              <p>Our mission at Livo is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Quality Assurance:</b>
            <p className=' text-gray-600'>We believe in lasting style over fleeting trends. Every piece in the LIVO collection is meticulously hand-selected and vetted by our experts to ensure it meets our stringent quality standards for fabric, finish, and durability. Choose LIVO for investment pieces built to last.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Effortless Convenience:</b>
            <p className=' text-gray-600'>We've designed the entire LIVO experience around your ease and comfort. With our user-friendly interface, streamlined selection process, and hassle-free ordering, discovering your next signature style piece has never been simpler.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Exceptional Customer Service:</b>
            <p className=' text-gray-600'>Your satisfaction is our top priority. Our dedicated team of professionals is here to provide personalized support for every query, from sizing advice to order tracking. We promise a truly seamless, human-centered shopping journey that exceeds expectations.</p>
          </div>
      </div>

      <NewsletterBox/>
      
    </div>
  )
}

export default About
