# Tripeaz - Khushboo Gujarat Ki

A modern, responsive taxi booking website built with Next.js, Tailwind CSS, and Anime.js for Tripeaz services.

## Features

- 🚖 **Modern Booking System** - Easy-to-use booking form with real-time validation
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Beautiful UI/UX** - Clean, professional design with orange theme
- ✨ **Smooth Animations** - Powered by Anime.js for engaging user experience
- 📧 **Email Integration** - Automatic booking confirmations via email
- 🗺️ **Popular Destinations** - Animated marquee showcasing Gujarat destinations
- 🎭 **Fun Meme Section** - Engaging content to connect with users
- 📊 **Trust Indicators** - Customer testimonials and service highlights

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Anime.js
- **Icons**: Lucide React
- **Email**: Nodemailer
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager
- Gmail account for email functionality

### Installation

1. **Clone or download the project**

   ```bash
   cd "Tripeaz"
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Configure Email Service**

   For Gmail:

   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password (not your regular password)
   - Use the App Password in `EMAIL_PASS`

   For other email services, update the service name in `src/app/api/send-booking/route.ts`

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/send-booking/     # Email API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── Navigation.tsx        # Header navigation
│   ├── HeroSection.tsx       # Landing hero section
│   ├── BookingForm.tsx       # Booking form component
│   ├── PopularDestinations.tsx # Destinations marquee
│   ├── OurServices.tsx       # Services section
│   ├── MemeSection.tsx       # Fun meme section
│   ├── HowItWorks.tsx        # Process explanation
│   ├── WhyTravelWithUs.tsx   # Benefits section
│   ├── CommunitySection.tsx  # Community & social
│   └── Footer.tsx            # Footer component
└── ...
```

## Customization

### Colors

The theme uses orange as the primary color. You can customize colors in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#f97316', // Main orange
    600: '#ea580c', // Darker orange
    // ... other shades
  }
}
```

### Content

- Update company information in `src/components/Footer.tsx`
- Modify services in `src/components/OurServices.tsx`
- Change destinations in `src/components/PopularDestinations.tsx`
- Update contact details throughout the components

### Email Configuration

The booking form sends emails to `tripeaz25@gmail.com`. To change this:

1. Update the email address in `src/app/api/send-booking/route.ts`
2. Modify the email templates as needed

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Features Overview

### 🏠 Landing Section

- Bold headline with brand messaging
- Clear call-to-action buttons
- Trust indicators and statistics

### 📋 Booking System

- Trip type selection (One-way, Round Trip, Airport)
- Location input with validation
- Date/time picker
- Passenger count selection
- Car type selection with pricing
- Contact information form
- Real-time email notifications

### 🗺️ Popular Destinations

- Animated marquee showcasing Gujarat cities
- Smooth scrolling effect
- Hover interactions

### 🚗 Services Section

- Chauffeur-driven services
- Outstation trips
- Airport transfers
- Corporate travel
- 24x7 support

### 🎭 Fun Elements

- Rotating meme content
- Travel-related humor
- Engaging animations

### 📱 Community Section

- Instagram integration
- App download buttons
- Social media links
- Gujarat monuments showcase

## Support

For support or questions:

- Email: info@gujarat.taxi
- Phone: +91 9512870958 
- Website: Tripeaz - Khushboo Gujarat Ki

## License

This project is owned and managed by **Wolfron Technologies LLP**.

---

**Tripeaz** - Experience Crafted with ❤️ in Gujarat, India
