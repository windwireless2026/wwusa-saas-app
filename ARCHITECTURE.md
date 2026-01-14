# 🏗️ Architecture Documentation - WindWireless SaaS

## Overview

WindWireless is a B2B SaaS platform for managing electronics inventory from US auctions, built with Next.js 16, React 19, TypeScript, and Supabase.

## Tech Stack

### Frontend

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: CSS Modules + CSS Variables
- **Internationalization**: next-intl 4.7.0
- **State Management**: React Context + TanStack Query
- **Forms**: Native + Zod validation
- **UI Components**: Radix UI primitives

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Row Level Security**: Enabled on all tables

### DevOps

- **Hosting**: Vercel (recommended)
- **CI/CD**: GitHub Actions
- **Environment**: Development, Staging, Production

## Project Structure

```
wwusa-saas-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── [locale]/          # Internationalized routes
│   │       ├── auth/          # Authentication pages
│   │       └── dashboard/     # Main application
│   ├── components/            # React components
│   │   ├── dashboard/         # Feature-specific components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── context/               # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── messages/              # i18n translations
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Next.js middleware
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── .env.local                 # Environment variables (gitignored)
```

## Key Features

### 1. Multi-language Support

- English (en)
- Portuguese (pt) - Default
- Spanish (es)

### 2. Core Modules

- **Inventory Management**: Track devices (IMEI/Serial)
- **Agents**: Manage suppliers, customers, partners
- **Product Catalog**: Models, manufacturers, types
- **Stock Locations**: Multi-warehouse support
- **Finance**: Invoices, payments, accounting
- **User Management**: Team access control

## Data Model

### Core Tables

- `profiles`: User profiles and roles
- `inventory`: Device inventory with tracking
- `product_catalog`: Product models and specs
- `manufacturers`: Approved brands
- `product_types`: Categories with tracking method
- `stock_locations`: Warehouse locations
- `agents`: Business partners (suppliers/customers)
- `company_settings`: Multi-tenant settings

### Security

- Row Level Security (RLS) enabled on all tables
- Role-based access: admin, manager, operator, viewer
- Audit logging on sensitive operations

## Design Patterns

### Component Architecture

- **Container/Presenter Pattern**: Separate logic from UI
- **Composition**: Small, reusable components
- **Custom Hooks**: Encapsulate business logic

### State Management

- **Local State**: useState for component-specific state
- **Global State**: Context API for app-wide state
- **Server State**: TanStack Query for API data

### Code Organization

```typescript
// Feature-based structure
features / inventory / components / AddItemModal.tsx;
InventoryTable.tsx;
hooks / useInventory.ts;
useInventoryMutations.ts;
types / inventory.types.ts;
utils / inventoryHelpers.ts;
```

## API Routes

### Authentication

- `/api/auth/*` - Supabase Auth integration

### Data Operations

- `/api/inventory/*` - Inventory CRUD
- `/api/agents/*` - Agent management
- `/api/products/*` - Product catalog

## Environment Variables

See `.env.example` for required configuration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## Development Workflow

1. **Start Dev Server**: `npm run dev`
2. **Run Linting**: `npm run lint`
3. **Type Checking**: `npm run type-check`
4. **Format Code**: `npm run format`

## Database Migrations

Migrations are located in `supabase/migrations/` and should be:

1. Numbered sequentially (001*, 002*, etc.)
2. Descriptive names
3. Idempotent (safe to run multiple times)
4. Tested before deployment

## Performance Considerations

- **React Compiler**: Enabled for automatic optimizations
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with App Router
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: TanStack Query for API responses

## Security Best Practices

1. **Never expose API keys** in client code
2. **Use RLS policies** for all database access
3. **Validate inputs** server-side with Zod
4. **Sanitize user inputs** to prevent XSS
5. **Use HTTPS** in production
6. **Regular dependency updates** for security patches

## Deployment

### Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Error boundaries in place
- [ ] Performance tested (Lighthouse)
- [ ] Security audit completed

### Vercel Deployment

1. Connect GitHub repository
2. Configure environment variables
3. Deploy from main branch
4. Set up custom domain (optional)

## Monitoring & Logging

- **Error Tracking**: Vercel Analytics
- **Performance**: Core Web Vitals
- **Database**: Supabase Dashboard
- **User Analytics**: (To be implemented)

## Contributing

See `CONTRIBUTING.md` for development guidelines.

## Roadmap

### Phase 1: Core Features ✅

- Inventory management
- User authentication
- Multi-language support

### Phase 2: Enhancements (In Progress)

- Advanced reporting
- Bulk operations
- Export/Import

### Phase 3: Future

- Mobile app
- AI-powered insights
- Third-party integrations

---

**Last Updated**: January 2026
**Version**: 0.1.0
