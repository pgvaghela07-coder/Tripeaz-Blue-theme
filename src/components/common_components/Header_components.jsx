import React from 'react'
import BookingForm from '../BookingForm'
import PopularDestinations from '../PopularDestinations'
import HeroSection from '../HeroSection'
import Navigation from '../Navigation'

function Header_Components() {
  return (
    <div>
        <Navigation />
        <BookingForm/>
        {/* <HeroSection/> */}
        <PopularDestinations/>
    </div>
  )
}

export default Header_Components