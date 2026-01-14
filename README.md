# 🚀 WindWireless SaaS Application

A modern B2B SaaS platform for managing electronics inventory from US auctions. Built with Next.js 16, React 19, TypeScript, and Supabase.

## ✨ Features

- 📦 **Inventory Management** - Track devices with IMEI/Serial numbers
- 👥 **Agent Management** - Manage suppliers, customers, and partners
- 🏭 **Product Catalog** - Comprehensive product database with manufacturers
- 📍 **Stock Locations** - Multi-warehouse support
- 💰 **Finance Module** - Invoicing and payment tracking
- 🌍 **Multi-language** - English, Portuguese, Spanish
- 🔐 **Row Level Security** - Supabase RLS for data protection
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5 (Strict Mode)
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS Modules + CSS Variables
- **Internationalization**: next-intl 4.7.0
- **State Management**: React Context + TanStack Query
- **Form Validation**: Zod
- **UI Components**: Radix UI
- **Code Quality**: ESLint + Prettier + Husky

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/wwusa-saas-app.git
   cd wwusa-saas-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run Database Migrations**

   Apply migrations in the `supabase/migrations/` folder to your Supabase project.

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 📁 Project Structure

```
wwusa-saas-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── [locale]/          # Internationalized routes
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── context/               # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── messages/              # i18n translations
│   ├── types/                 # TypeScript types
│   └── proxy.ts               # Next.js proxy (routing)
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── [config files]             # Configuration files
```

## 🌍 Internationalization

The application supports three languages:

- **English** (en)
- **Portuguese** (pt) - Default
- **Spanish** (es)

Translation files are located in `src/messages/`.

## 🔐 Authentication

Authentication is handled by Supabase Auth. The application uses:

- Email/Password authentication
- Row Level Security (RLS) for data access control
- Role-based permissions (admin, manager, operator, viewer)

## 📊 Database

The application uses Supabase (PostgreSQL) with the following main tables:

- `profiles` - User profiles and roles
- `inventory` - Device inventory
- `product_catalog` - Product models
- `manufacturers` - Brands
- `product_types` - Categories
- `agents` - Business partners
- `stock_locations` - Warehouse locations
- `company_settings` - Multi-tenant settings

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📚 Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [API Documentation](./API.md)
- [Changelog](./CHANGELOG.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

## 👥 Team

- **Development**: WindWireless Development Team
- **Contact**: dev@windwireless.com

## 🔗 Links

- [Production Site](https://your-domain.com)
- [Supabase Dashboard](https://app.supabase.com)
- [Documentation](./ARCHITECTURE.md)

---

**Built with ❤️ by WindWireless Team**

Last Updated: January 2026 • Version 0.1.0
