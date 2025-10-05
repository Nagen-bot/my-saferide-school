# School Van Ride Booking System

## Project Overview
- **Name**: Van Ride Booking System for Botani & Imperial International Schools Ipoh
- **Goal**: Streamline school van transportation booking for students and parents
- **Features**: 
  - User registration and authentication (students, parents, drivers, admins)
  - Route and stop management for both schools
  - Real-time van booking system
  - Driver and van assignment management
  - Booking history and status tracking

## URLs
- **Production**: https://school-van-ride.pages.dev (Deploy following DEPLOYMENT.md)
- **Development**: https://3000-i4duc2lge8jtkn68w6635-6532622b.e2b.dev
- **Health Check**: `/api/schools` (returns school list)
- **GitHub**: https://github.com/Nagen-bot/my-saferide-school

## Data Architecture
- **Data Models**: 
  - Users (students, parents, drivers, admins)
  - Vans (with capacity and school assignment)
  - Routes (with pickup/dropoff areas and times)
  - Route Stops (specific locations within routes)
  - Van Routes (van assignments to routes by day/time)
  - Bookings (student van ride reservations)
  - Subscriptions (monthly recurring bookings)
  - Emergency Contacts
- **Storage Services**: Cloudflare D1 SQLite database (local development mode)
- **Data Flow**: REST API → Cloudflare D1 → Frontend JavaScript

## Currently Implemented Features
- ✅ Complete database schema with relational design
- ✅ User authentication system (login/register)
- ✅ School-based route management
- ✅ Dynamic route and stop loading
- ✅ Van availability checking
- ✅ Booking creation and management
- ✅ Booking cancellation
- ✅ User dashboard with booking history
- ✅ Responsive web interface with TailwindCSS
- ✅ Real-time form validation

## User Guide
1. **Registration**: 
   - Choose your role (Student or Parent)
   - Select your school (Botani or Imperial International)
   - Students enter their class information
2. **Login**: Use your registered email and password
3. **Booking a Ride**:
   - Select a route from your school's available routes
   - Choose a pickup/dropoff stop
   - Pick your travel date
   - Select morning pickup or afternoon dropoff
   - Add any special instructions
4. **Managing Bookings**: View your booking history and cancel if needed

## Features Not Yet Implemented
- ❌ Admin dashboard for school administrators
- ❌ Driver interface for managing routes
- ❌ Real-time van tracking
- ❌ Push notifications for booking updates
- ❌ Monthly subscription management
- ❌ Payment integration
- ❌ Advanced reporting and analytics
- ❌ Emergency contact management interface

## Recommended Next Steps
1. **Database Setup**: Configure Cloudflare D1 production database
2. **Admin Interface**: Build management dashboard for school admins
3. **Driver App**: Create driver interface for route management
4. **Payment System**: Integrate payment processing for bookings
5. **Notifications**: Add email/SMS notifications for booking confirmations
6. **Testing**: Add comprehensive test coverage
7. **Production Deployment**: Deploy to Cloudflare Pages with proper domain

## API Endpoints
### Authentication
- `POST /api/login` - User authentication
- `POST /api/register` - User registration

### Schools & Routes
- `GET /api/schools` - List all schools
- `GET /api/routes/:school` - Get routes for a school
- `GET /api/routes/:routeId/stops` - Get stops for a route

### Bookings
- `GET /api/vans/available` - Check van availability
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/user/:userId` - Get user's bookings
- `PUT /api/bookings/:bookingId/cancel` - Cancel booking

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: 🚀 Ready for Production Deployment
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare D1
- **GitHub**: Code pushed and ready for deployment
- **Instructions**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment steps
- **Last Updated**: October 5, 2025

## Demo Credentials (For Testing)
*Note: Database seeding requires Cloudflare D1 setup*
- **Student**: student1@botani.edu.my / password
- **Parent**: parent1@gmail.com / password  
- **Admin**: admin@botani.edu.my / password

## 🚀 Quick Deployment to Cloudflare Pages

### Method 1: Cloudflare Dashboard (Recommended)
1. Visit [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect to GitHub → Select `Nagen-bot/my-saferide-school`
3. Build settings: `npm run build` → Output: `dist`
4. Deploy! Your app will be at `https://school-van-ride.pages.dev`

### Method 2: Wrangler CLI
```bash
npm run build
npx wrangler pages deploy dist --project-name school-van-ride
```

📖 **Full deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Development Setup
1. `npm install` - Install dependencies
2. `npm run build` - Build the application
3. `npm run db:migrate:local` - Apply database migrations (requires Cloudflare setup)
4. `npm run db:seed` - Seed test data (requires Cloudflare setup)
5. `pm2 start ecosystem.config.cjs` - Start development server
6. Visit `http://localhost:3000` or use the public sandbox URL