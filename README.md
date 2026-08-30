# LOGISTIC STAR BD LTD. - Frontend

A modern, responsive Next.js web application for **LOGISTIC STAR BD LTD.**, an international air freight and logistics company. This site showcases services, provides shipment tracking, and facilitates customer inquiries for fast, reliable, and secure international courier solutions.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black)
![React](https://img.shields.io/badge/React-19.2.8-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6)

---

## 🌟 Overview

**LOGISTIC STAR BD LTD.** is a global logistics company specializing in air-only cargo solutions connecting Bangladesh, China, and international destinations. This frontend application provides:

- **Service Showcase**: Display of international courier, air freight, express delivery, and door-to-door logistics services
- **Real-time Tracking**: Shipment tracking with detailed status updates and delivery timeline
- **Service Overview**: Visual representation of the 7-step delivery process from booking to final delivery
- **Customer Testimonials**: Reviews from verified customers and partners
- **Request Shipment Form**: Easy-to-use form for customers to request quotes and submit shipments
- **Responsive Design**: Fully responsive interface optimized for mobile, tablet, and desktop devices

---

## 🚀 Key Features

✅ **Interactive Hero Section** - Eye-catching landing section with call-to-action and tracking widget  
✅ **Service Cards** - Four comprehensive service offerings with images and descriptions  
✅ **Delivery Process Timeline** - Visual 7-step animated timeline of the logistics process  
✅ **Why Choose Us Section** - Feature highlights with smooth animations  
✅ **Customer Reviews** - Testimonials grid with star ratings  
✅ **Shipment Tracking** - Mock tracking system with sample data (LSBD1234567)  
✅ **Request Quote Form** - Contact form with validation for shipment inquiries  
✅ **Responsive Footer** - Company info, navigation links, and social media integration  
✅ **Smooth Animations** - Framer Motion animations for enhanced user experience  
✅ **Type-Safe Code** - Full TypeScript support with comprehensive type definitions

---

## 📦 Tech Stack

### Core Framework

- **Next.js 16.3.3** - React framework with App Router (current directory structure)
- **React 19.2.8** - UI library
- **TypeScript 5.0+** - Type safety and better developer experience

### Styling & UI

- **Tailwind CSS 4.3.3** - Utility-first CSS framework
- **Radix UI 1.6.7** - Unstyled, accessible component primitives
- **CVA (Class Variance Authority) 0.7.1** - Type-safe CSS-in-JS component patterns
- **Tailwind Merge 3.6.0** - Merge Tailwind CSS classes intelligently

### Animations & Interactions

- **Framer Motion 13.1.1** - Production-ready animation library
- **Lucide React 1.34.0** - Icon library with comprehensive icon set

### Forms & Validation

- **React Hook Form 7.86.0** - Efficient form management with minimal re-renders
- **Built-in form validation** - Email, required field validation

### Utilities

- **clsx 2.1.1** - Utility for combining classNames
- **next/font** - Optimized Google Font loading (Plus Jakarta Sans)

---

## 📁 Project Structure

```
LSBD-Frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata and font configuration
│   │   ├── page.tsx            # Home page - main landing page
│   │   └── globals.css         # Global CSS styles and Tailwind directives
│   │
│   ├── components/
│   │   ├── Navbar.tsx                 # Navigation bar with mobile menu
│   │   ├── HeroSection.tsx            # Hero banner with tracking widget
│   │   ├── HeroBG.tsx                 # Hero background component
│   │   ├── ServicesSection.tsx        # Service cards grid (4 services)
│   │   ├── DeliveryProcess.tsx        # 7-step process timeline with animations
│   │   ├── WhyChooseUs.tsx            # Features showcase section
│   │   ├── CustomersReview.tsx        # Customer testimonials grid
│   │   ├── RequestShipmentForm.tsx    # Quote request form
│   │   ├── TrackingWidget.tsx         # Shipment tracking search & results
│   │   ├── Footer.tsx                 # Footer with company info and links
│   │   ├── index.ts                   # Component exports barrel file
│   │   ├── ui/                        # Reusable UI components
│   │   │   ├── button.tsx             # Custom Button component
│   │   │   └── input.tsx              # Custom Input component
│   │   └── icons/
│   │       └── SocialIcons.tsx        # Social media icon mappings
│   │
│   ├── data/
│   │   ├── index.ts                   # Data exports barrel file
│   │   ├── services.ts                # Service definitions and metadata
│   │   ├── process-steps.ts           # 7-step delivery process data
│   │   ├── reviews.ts                 # Customer review testimonials
│   │   ├── features.ts                # Why Choose Us feature list
│   │   └── mock-shipments.ts          # Mock tracking data with fallback function
│   │
│   └── lib/
│       ├── types.ts                   # TypeScript type definitions
│       ├── constants.ts               # Global constants (nav links, company info)
│       └── utils.ts                   # Utility functions (cn - className merger)
│
├── public/                           # Static assets
│   └── *.png                        # Service and hero images
│
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration with path aliases
├── next.config.ts                    # Next.js configuration
├── postcss.config.mjs                # PostCSS configuration for Tailwind
├── tailwind.config.js                # Tailwind CSS configuration
├── eslint.config.mjs                 # ESLint configuration
├── components.json                   # Component library configuration
└── parse_figma.js                    # Utility script for parsing Figma design data
```

---

## 🎨 Component Overview

### Layout & Navigation

- **Navbar** - Sticky header with logo, navigation links, mobile menu toggle, and CTA button
- **Footer** - Company information, link groups, social media, and contact details

### Hero Section

- **HeroSection** - Main landing section with animated heading and tracking widget
- **HeroBG** - Background with gradient effects and decorative elements
- **TrackingWidget** - Search form for shipment tracking with mock data support

### Main Sections

- **ServicesSection** - Grid display of 4 core services with hover effects
- **DeliveryProcess** - Animated horizontal timeline showing 7 delivery stages
- **WhyChooseUs** - Feature list with checkmark icons and images
- **CustomersReview** - 3-card grid of customer testimonials with star ratings
- **RequestShipmentForm** - Contact form for shipment requests with field validation

### UI Components (Reusable)

- **Button** - Flexible button component with variants (uses CVA)
- **Input** - Text input with consistent styling and validation support

---

## 📊 Data Structures & Types

### Core TypeScript Interfaces (in `lib/types.ts`)

```typescript
// Navigation
interface NavLink {
  id: string;
  label: string;
  href: string;
}

// Services
interface Service {
  icon: LucideIcon;
  image: string;
  title: string;
  desc: string;
  tag: string;
}

// Delivery Process
interface ProcessStep {
  id: string;
  title: string;
  desc: string;
}

// Customer Reviews
interface Review {
  quote: string;
  name: string;
  company: string;
  initials: string;
}

// Shipment Tracking
interface TrackingStep {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

interface TrackingStatus {
  id: string;
  sender: string;
  recipient: string;
  origin: string;
  destination: string;
  status: string;
  estimatedDelivery: string;
  steps: TrackingStep[];
}

// Request Form
interface RequestFormData {
  fullName: string;
  phone: string;
  email: string;
  weight: string;
  origin: string;
  destination: string;
  shipmentType: string;
  message: string;
}

// Features
interface Feature {
  id: string;
  text: string;
}

// Company Info
interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  expressHelpline: string;
}
```

---

## 🎯 Key Data Files

### `services.ts`

- **International Courier** - Global parcel delivery service
- **Air Freight** - Commercial freight solutions
- **Express Delivery** - Time-critical document delivery
- **Door-to-Door Logistics** - End-to-end shipment handling

### `process-steps.ts`

Seven-step delivery process:

1. Booking
2. Pickup
3. Packing & Consolidation
4. Export Clearance
5. Air Transit
6. Import Clearance
7. Door Delivery

### `reviews.ts`

Mock customer testimonials with company names and ratings

### `mock-shipments.ts`

- Sample tracking ID: **LSBD1234567** (Dhaka → London)
- Fallback function for generating tracking data for any ID
- Complete tracking timeline with timestamps and locations

### `features.ts`

Five key features showcased in the "Why Choose Us" section:

- Air-only network
- Two-way service
- One coordinator
- Transparent pricing
- Careful handling procedures

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn** or **pnpm** or **bun**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd LSBD-Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open in browser**
   Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm run start
```

---

## 📋 Available Scripts

```json
{
  "dev": "next dev", // Start development server with hot reload
  "build": "next build", // Build for production
  "start": "next start", // Start production server
  "lint": "eslint" // Run ESLint for code quality
}
```

---

## 🎨 Styling & Design System

### Color Scheme

- **Primary Dark**: `#08254a` - Main text and headings
- **Primary Green**: `#079447` - Accent, buttons, highlights
- **Light Background**: `#f9f9ff` - Page background
- **Secondary Background**: `#e3eaf8` - Section backgrounds

### Typography

- **Font**: Plus Jakarta Sans (from Google Fonts, optimized via next/font)
- **Font Weights**: 300, 400, 500, 600, 700, 800
- **Variable CSS**: `--font-plus-jakarta` for custom implementations

### Responsive Breakpoints (Tailwind CSS)

- **Mobile**: 0 - 640px (base)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Animation Details

- **Framer Motion**: Smooth enter animations with staggered delays
- **Transitions**: Opacity, scale, and position changes
- **Viewport-based**: Animations trigger on scroll using `whileInView`

---

## 🔄 Form Handling

### RequestShipmentForm

- **Library**: React Hook Form
- **Fields**:
  - Full Name (required)
  - Phone (required)
  - Email (required, email validation)
  - Weight (required)
  - Origin (required)
  - Destination (required)
  - Shipment Type (dropdown with options)
  - Message (optional textarea)
- **Validation**: Real-time validation with error messages
- **Submission**: Mock submission with 600ms delay and success notification

### TrackingWidget

- **Search Input**: Text field for tracking number entry
- **Sample Data**: Pre-populated example (LSBD1234567)
- **Results**: Detailed timeline view with step status

---

## 🔌 Configuration Files

### `tsconfig.json`

- **Target**: ES2017
- **Module**: esnext
- **Path Alias**: `@/*` maps to `./src/*`
- **Strict Mode**: Enabled for type safety

### `tailwind.config.js`

- Uses Tailwind CSS v4
- Custom color definitions for brand colors
- Extended spacing and sizing utilities

### `next.config.ts`

- Empty configuration (uses Next.js defaults)
- Ready for custom configurations as needed

### `postcss.config.mjs`

- Tailwind CSS v4 PostCSS plugin configured

### `components.json`

- Component library scaffolding configuration

---

## 📱 Responsive Features

The application is fully responsive with mobile-first design:

- **Mobile Navigation**: Hamburger menu with slide-out navigation
- **Responsive Grids**: Components adapt from 1 column (mobile) to multi-column layouts
- **Touch-friendly**: Buttons and interactive elements sized appropriately
- **Image Optimization**: Next.js Image component for automatic optimization
- **Viewport-based Animations**: Animations only trigger when elements enter viewport

---

## 🚀 Tracking Feature

### How Tracking Works

1. User enters a tracking number (e.g., LSBD1234567)
2. Application searches mock shipments database
3. If found, displays detailed tracking information
4. If not found, generates fallback tracking data
5. Shows timeline with completed/current/pending steps

### Sample Tracking Number

- **ID**: LSBD1234567
- **Route**: Dhaka (DAC) → London Heathrow (LHR)
- **Status**: Air Transit in Progress
- **Steps**: 6 (with current step highlighted)

---

## 🔐 Security & Best Practices

✅ **TypeScript**: Full type safety throughout the codebase  
✅ **ESLint**: Code quality enforcement with Next.js recommended config  
✅ **Server Components**: Uses Next.js Server Components where appropriate  
✅ **Image Optimization**: Automatic image optimization via Next.js  
✅ **Font Optimization**: Google Fonts loaded optimally with `next/font`  
✅ **Form Validation**: Client-side validation before submission  
✅ **Accessibility**: Semantic HTML and ARIA labels where needed

---

## 🌐 Key Features Implementation Details

### 1. Navigation

- Sticky navbar with backdrop blur effect
- Mobile hamburger menu for small screens
- Smooth scroll anchors to page sections
- Active state tracking for current section

### 2. Hero Section

- Large, attention-grabbing heading with color accent
- Background gradient effects with glowing elements
- Integrated tracking widget for immediate user engagement
- Optimized for both mobile and desktop viewing

### 3. Services Grid

- 4-card responsive grid layout
- Hover animations with image scale effect
- Icon + image + text combination
- Service tags for categorization

### 4. Process Timeline

- Horizontal scrollable timeline (mobile-optimized)
- Animated progress line showing completion status
- Animated plane icon moving along the timeline
- Detailed step descriptions

### 5. Customer Reviews

- 3-card grid layout (stacked on mobile)
- Star rating display
- Quote icon for visual hierarchy
- Company attribution for credibility

### 6. Request Form

- Two-column layout (stacked on mobile)
- Real-time form validation
- Success state with animated confirmation
- Grouped related fields
- Emergency contact callout box

### 7. Footer

- Company logo and description
- Contact information with icons
- Organized link groups
- Social media integration
- Responsive grid layout

---

## 🎓 Development Workflow

### Adding a New Component

1. Create component file in `src/components/`
2. Define TypeScript interface if needed in `lib/types.ts`
3. Export from `components/index.ts`
4. Use in `app/page.tsx` or other components

### Adding New Data

1. Create data file in `src/data/`
2. Define type in `lib/types.ts`
3. Export from `data/index.ts`
4. Import and use in components

### Styling Components

1. Use Tailwind CSS utility classes
2. Leverage custom colors from `tailwind.config.js`
3. Use `cn()` utility for conditional class merging
4. Keep responsive design in mind (mobile-first approach)

### Animation Guidelines

1. Use Framer Motion for complex animations
2. Implement `whileInView` for scroll-triggered animations
3. Keep animation duration between 0.3-0.6s for UI elements
4. Use staggered delays for list items

---

## 📈 Performance Optimization

- **Image Optimization**: Next.js Image component with automatic sizing
- **Font Loading**: Optimized Google Font loading
- **Code Splitting**: Automatic code splitting by Next.js
- **CSS-in-JS**: Minimal CSS with Tailwind's PurgeCSS
- **Lazy Loading**: Components animate in on scroll
- **Responsive Images**: `sizes` attribute for optimal image delivery

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
npm run dev -- -p 3001
```

### TypeScript Errors

```bash
npm run lint
```

### Build Failures

```bash
rm -rf .next
npm run build
```

---

## 📝 Environment Variables

Currently, no environment variables are required. The application uses:

- Mock data for tracking
- Static company information from constants
- Client-side form handling

For future integrations (API calls, CMS, etc.):

- Create `.env.local` file
- Add variables: `NEXT_PUBLIC_API_URL`, etc.
- Use in components with `process.env.NEXT_PUBLIC_*`

---

## 🔮 Future Enhancements

Potential features for upcoming versions:

1. **Backend Integration**
   - Real shipment tracking API
   - Customer authentication system
   - Persistent form submissions

2. **Advanced Features**
   - Real-time price calculator
   - Multi-language support (i18n)
   - Dark mode toggle
   - Customer dashboard

3. **Content Management**
   - CMS integration (Sanity, Contentful, etc.)
   - Blog/News section
   - Dynamic testimonials

4. **Performance**
   - Image CDN integration
   - Advanced caching strategies
   - Server-side rendering optimization

5. **Analytics & Monitoring**
   - Google Analytics / Vercel Analytics integration
   - Error tracking (Sentry)
   - Performance monitoring

6. **E-commerce**
   - Rate calculator
   - Online booking system
   - Payment integration

---

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

---

## 📄 License

This project is private and proprietary to LOGISTIC STAR BD LTD.

---

## 📞 Contact & Support

**LOGISTIC STAR BD LTD.**

- 📧 Email: info@logisticsstarbd.com
- 📱 Phone: +880 [Your Number]
- 🚨 Express Helpline: +880 9612-LSBD-00
- 📍 Address: [Office Address, Dhaka, Bangladesh]

---

## 🤝 Contributing

For internal team members, please follow these guidelines:

1. Create feature branches from `main`
2. Use TypeScript for all new code
3. Follow ESLint configuration
4. Test responsive design across devices
5. Write clear commit messages

---

**Last Updated**: August 2026  
**Current Version**: 0.1.0  
**Next.js Version**: 16.3.3  
**React Version**: 19.2.8
