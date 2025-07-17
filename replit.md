# ImmoPro - Real Estate Platform

## Overview
ImmoPro is a modern full-stack real estate platform built with React, Express, and PostgreSQL. The application allows users to browse properties, manage favorites, and contact property owners. It includes an admin dashboard for property management and uses Replit Auth for authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL session store
- **File Upload**: Multer for handling property images
- **API Design**: RESTful API with JSON responses

### Database Schema
- **Users**: Stores user profiles from Replit Auth
- **Properties**: Main property listings with location data
- **Favorites**: User-property relationships for saved properties
- **Contact Requests**: Inquiries from potential buyers/renters
- **Sessions**: Server-side session storage for authentication

## Key Components

### Authentication System
- Uses Replit Auth for secure user authentication
- Session-based authentication with PostgreSQL storage
- Protected routes for admin functionality
- User profile management with first name, last name, and email

### Property Management
- CRUD operations for property listings
- Image upload functionality for property photos
- Advanced filtering by type, location, price, and features
- Featured properties system for highlighting listings
- Map integration for property visualization

### User Features
- Property browsing with search and filters
- Favorites system for saving properties
- Contact form for property inquiries
- Responsive design for mobile and desktop

### Admin Dashboard
- Property management interface
- Contact request monitoring
- User administration capabilities
- Analytics and statistics

## Data Flow

1. **User Authentication**: Replit Auth handles OAuth flow and user session creation
2. **Property Browsing**: Frontend fetches properties via REST API with optional filters
3. **Favorites Management**: Authenticated users can add/remove favorites with optimistic updates
4. **Contact Requests**: Users submit inquiries which are stored and accessible to admins
5. **Admin Operations**: Admins can perform CRUD operations on properties and view analytics

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and developer experience
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Database: Drizzle migrations handle schema changes

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `NODE_ENV`: Environment mode (development/production)

### File Structure
- `client/`: React frontend application
- `server/`: Express backend application
- `shared/`: Shared TypeScript types and schemas
- `migrations/`: Database migration files

## Changelog
- July 05, 2025. Initial setup
- July 05, 2025. Added complete multilingual support (French, English, Arabic with RTL) using i18next and react-i18next

## Recent Changes
- **Multilingual System**: Implemented complete i18n support with:
  - French (default), English, and Arabic languages
  - RTL support for Arabic with CSS adaptations
  - Language switcher component with flags
  - Comprehensive translation files for all UI elements
  - Direction detection and automatic HTML attribute management

- **Authentication & User Profiles** (July 06, 2025): 
  - Successfully implemented Replit Auth integration
  - Complete user profile page with personal information display
  - User favorites management system
  - Contact requests tracking for users
  - Secure API routes with authentication middleware
  - Profile navigation integrated in main navigation
  - Confirmed working by user testing

- **Admin Dashboard & Property Management** (July 17, 2025):
  - Complete admin dashboard with real-time statistics
  - Property CRUD operations (create, read, update, delete)
  - Admin rights system with secure route protection
  - Contact requests management interface
  - City distribution analytics for Mauritanian cities
  - MRU currency integration throughout admin interface
  - User confirmed system working perfectly

## User Preferences
- Preferred communication style: Simple, everyday language in French
- Multilingual support: French (primary), English, Arabic with RTL