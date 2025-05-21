# ShopSphere

## Introduction

ShopSphere is a full-featured multi-vendor e-commerce platform that provides a seamless shopping experience for users while offering robust tools for vendors to manage their products and sales. The application supports real-time communication between users and vendors, secure payment processing, product comparison, wishlists, and many other modern e-commerce features.

## Live Demo

[ShopSphere Live Demo](https://shops-sphere.vercel.app)

## Technologies Used

- **Frontend**:
  - Next.js 14 (App Router)
  - React
  - TailwindCSS
  - Shadcn UI
  - React Hook Form
  - Zod (for form validation)

- **Backend**:
  - Next.js API Routes
  - MongoDB (with Mongoose)
  - NextAuth.js (for authentication)
  - Socket.IO (for real-time chat)

- **Payment Processing**:
  - Stripe

- **Deployment**:
  - Vercel

## Key Features

- **User Features**:
  - Authentication (Email, Google OAuth)
  - Product browsing and filtering
  - Shopping cart management
  - Wishlists
  - Product comparison
  - Order tracking
  - Real-time chat with vendors
  - Coupon application
  - Secure checkout with Stripe

- **Vendor Features**:
  - Product management
  - Order management
  - Sales analytics
  - Chat with customers
  - Store customization

- **Admin Features**:
  - User management
  - Vendor management
  - Product approval
  - Category management
  - Analytics dashboard

## Installation and Setup

### Prerequisites

- Node.js 18 or higher
- MongoDB account
- Stripe account
- Google OAuth credentials (optional, for Google login)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/shop-sphere.git
   cd shop-sphere
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory with the following variables:
   ```bash
   # Database
   MONGODB_URI="your_mongodb_connection_string"

   # Next Auth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"

   # Email (for email notifications)
   EMAIL_USER="your_email"
   EMAIL_PASS="your_email_app_password"
   EMAIL_FROM="noreply@yourdomain.com"

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Start with custom server (for Socket.IO)**:
   ```bash
   node server.js
   ```

6. **Visit the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
```

## Running in Production

For production deployment with Socket.IO support:

```bash
node server.js
```

## Project Structure

- `/src/app`: Next.js app router and pages
- `/src/components`: React components
- `/src/lib`: Utility functions and libraries
- `/src/app/api`: API routes
- `/public`: Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.