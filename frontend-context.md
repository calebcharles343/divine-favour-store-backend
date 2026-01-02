# Nigerian Local Store App - Development Context

## Project Overview

A simple, intuitive store management app for Nigerian local businesses that tracks inventory, sales, and profit/loss. Designed to be usable by people of all ages and tech literacy levels.

## Backend API Summary

### Base URL

```
http://localhost:4002/api/v1
```

### Key Endpoints

#### Authentication

- `POST /auth/signin` - Login
- `POST /auth/signup` - Register
- `GET /auth/me` - Get current user
- `PATCH /auth/update-password` - Update password

#### Products

- `GET /store-products` - List all products
- `GET /store-products/:id` - Get single product
- `POST /store-products` - Create product (Admin/Manager)
- `PUT /store-products/:id` - Update product (Admin/Manager)
- `DELETE /store-products/:id` - Delete product (Admin)

#### Sales

- `POST /store-products/sales/record` - Record sale (Staff+)
- `GET /store-products/sales/stats` - Sales statistics (Manager+)
- `GET /store-products/reports/profit-loss` - Profit/Loss report (Manager+)

## Frontend Architecture Plan

### Tech Stack

```
React 18 + TypeScript
Redux Toolkit + RTK Query
Radix UI Components
Tailwind CSS
React Hook Form + Zod
React Router DOM
Axios
Lucide React (Icons)
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix-based components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── features/           # Feature-based modules
│   ├── auth/
│   ├── products/
│   ├── sales/
│   └── dashboard/
├── lib/                # Utilities and configurations
│   ├── api/            # API clients and RTK Query
│   ├── utils/          # Helper functions
│   └── validations/    # Zod schemas
├── hooks/              # Custom React hooks
├── store/              # Redux store configuration
├── types/              # TypeScript type definitions
└── pages/              # Page components
```

## Core UX Principles for Simplicity

### 1. Visual Design

- **Large, clear buttons** (min 44px touch targets)
- **High contrast colors** for readability
- **Consistent iconography** with text labels
- **Progressive disclosure** - show only what's needed
- **Visual hierarchy** - most important actions most prominent

### 2. Interaction Patterns

- **One primary action per screen**
- **Minimal typing** - use selects, toggles, buttons
- **Clear feedback** for all actions
- **Undo capabilities** where possible
- **Step-by-step workflows** for complex tasks

### 3. Content Strategy

- **Simple, direct language** - avoid technical terms
- **Nigerian context** - use familiar terms like "₦" instead of "currency"
- **Visual math** - show calculations clearly
- **Status indicators** - always show what's happening

## Implementation Guide

### Step 1: Project Setup

```bash
# Create React app with TypeScript
npx create-react-app nigerian-store-frontend --template typescript
cd nigerian-store-frontend

# Install core dependencies
npm install @reduxjs/toolkit react-redux
npm install @radix-ui/react-*
npm install tailwindcss postcss autoprefixer
npm install react-router-dom
npm install axios
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 2: Configure Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        nigerian: {
          green: "#008753",
          white: "#FFFFFF",
          green: "#008753",
        },
      },
      fontSize: {
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
      },
    },
  },
  plugins: [],
};
```

### Step 3: Create API Layer

```typescript
// src/lib/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4002/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Product", "Sale", "User"],
  endpoints: () => ({}),
});
```

### Step 4: Design System Components

#### Button Component Example

```tsx
// src/components/ui/Button.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        lg: "h-12 px-6 text-xl",
        md: "h-10 px-4 text-lg",
        sm: "h-8 px-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg", // Default to large for accessibility
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Step 5: Key Feature Implementations

#### Product Management Interface

```tsx
// src/features/products/components/ProductCard.tsx
const ProductCard = ({ product }) => (
  <div className="bg-white rounded-lg shadow-md p-4 border">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-600 text-lg">{product.category}</p>
      </div>
      <Badge
        variant={
          product.currentStock <= product.minStockLevel ? "danger" : "success"
        }
      >
        Stock: {product.currentStock}
      </Badge>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2 text-lg">
      <div>
        <span className="text-gray-600">Price:</span>
        <span className="font-semibold ml-2">₦{product.pricePerUnit}</span>
      </div>
      <div>
        <span className="text-gray-600">Cost:</span>
        <span className="font-semibold ml-2">₦{product.costPrice}</span>
      </div>
    </div>
  </div>
);
```

#### Sales Recording Interface

```tsx
// src/features/sales/components/SaleForm.tsx
const SaleForm = () => (
  <div className="max-w-2xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6">Record Sale</h1>

    <div className="space-y-4">
      <Select
        label="Select Product"
        options={products}
        placeholder="Choose product..."
        size="lg"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          type="number"
          size="lg"
          min="0.01"
          step="0.01"
        />
        <Input label="Unit Price (₦)" type="number" size="lg" disabled />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-xl font-semibold text-center">
          Total: <span className="text-green-600">₦1,500.00</span>
        </div>
      </div>

      <Button size="lg" className="w-full">
        <ShoppingCart className="w-6 h-6 mr-2" />
        Complete Sale
      </Button>
    </div>
  </div>
);
```

### Step 6: Accessibility Considerations

```tsx
// src/hooks/useAccessibility.ts
export const useAccessibility = () => {
  // Focus management for keyboard navigation
  // Screen reader announcements
  // High contrast mode support
  // Font size scaling
};

// src/components/Layout/AppLayout.tsx
const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900">
            🇳🇬 Divine Favour Store
          </h1>
          <FontSizeSelector />
        </div>
      </div>
    </header>
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
  </div>
);
```

## Development Priorities

### Phase 1: Core MVP (Week 1-2)

- [ ] Authentication flow
- [ ] Product listing and viewing
- [ ] Basic sales recording
- [ ] Simple dashboard

### Phase 2: Enhanced UX (Week 3-4)

- [ ] Advanced product management
- [ ] Sales analytics
- [ ] Stock alerts
- [ ] Offline capability

### Phase 3: Polish (Week 5-6)

- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Nigerian localization
- [ ] Error handling and user guidance

## Testing Strategy

### User Testing Focus

- **Elderly users**: Font size, contrast, simple navigation
- **First-time computer users**: Intuitive workflows, minimal steps
- **Store owners**: Quick access to frequent actions
- **Staff members**: Fast sales recording under pressure

### Success Metrics

- Task completion time < 30 seconds for sales
- Zero training required for basic operations
- Accessibility score > 95%
- User satisfaction > 4.5/5

## Deployment Notes

### Production Build

```bash
npm run build
# Optimize bundle for slower internet connections
# Test on actual low-end devices common in Nigerian markets
```

### Performance Targets

- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Works reliably on 3G connections
- Functions with intermittent connectivity

This approach ensures the app remains beautiful and professional while being accessible to users of all technical abilities and ages in the Nigerian context.
