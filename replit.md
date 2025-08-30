# Overview

This is a Booking.com-style travel booking application built with React and Express. The application features a modern travel booking interface where users can search for accommodations, browse destinations, property types, and special offers. It's designed as a full-stack web application with a React frontend using shadcn/ui components and an Express backend with PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation and formatting

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between client and server
- **Development**: Hot reload with Vite integration in development mode
- **Storage**: In-memory storage implementation with interface for easy database migration

## Database Design
- **Database**: PostgreSQL configured through Drizzle
- **Schema Design**: 
  - Users table for authentication
  - Destinations table for travel locations
  - Property types table for accommodation categories
  - Offers table for promotional content
  - Search requests table for tracking user searches
- **Schema Validation**: Drizzle-Zod integration for runtime validation

## API Structure
- RESTful API design with Express routes
- Endpoints for destinations, property types, offers, and search functionality
- Centralized error handling middleware
- Request/response logging for debugging
- JSON-based communication between frontend and backend

## Development Workflow
- **Monorepo Structure**: Shared types and schemas between client and server
- **Build Process**: Vite for frontend bundling, esbuild for server compilation
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Path Aliases**: Organized imports with @ prefixes for clean code structure

# External Dependencies

## Database Services
- **PostgreSQL**: Primary database (configured via DATABASE_URL environment variable)
- **Neon Database**: Serverless PostgreSQL integration via @neondatabase/serverless

## UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Web fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

## Development Tools
- **Replit Integration**: Custom plugins for development environment integration
- **Vite Plugins**: Runtime error overlay and cartographer for enhanced development experience
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Form and Data Handling
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **TanStack React Query**: Server state management and caching
- **date-fns**: Date manipulation and formatting utilities

## Build and Runtime
- **esbuild**: Fast JavaScript bundler for server code
- **tsx**: TypeScript execution for development
- **Embla Carousel**: Carousel component for image galleries