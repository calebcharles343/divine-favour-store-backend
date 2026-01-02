## **Step 10: Create API Documentation**

### **File 15: README.md**

````markdown
# Nigerian Store API

A simple bookkeeping system for Nigerian stores with support for local measurement units (mudu, baskets, etc.).

## Features

- ✅ User authentication with role-based access (Super Admin, Admin, Manager, Staff)
- ✅ Product management with Nigerian measurement units (scale/kg, container/mudu)
- ✅ Sales recording with automatic calculation
- ✅ Inventory tracking and alerts
- ✅ Profit & loss reports
- ✅ File upload support (product images, documents)
- ✅ Validation and error handling
- ✅ Nigerian store products seed data

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nigerian-store-api
```
````

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nigerian-store
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Seed the database:

```bash
npm run seed
```

5. Start the server:

```bash
npm run dev  # Development
npm start    # Production
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/signin` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)
- `PATCH /api/v1/auth/update-password` - Update password (protected)

### Products

- `GET /api/v1/store-products` - Get all products
- `POST /api/v1/store-products` - Create product (Admin/Manager)
- `GET /api/v1/store-products/:id` - Get single product
- `PUT /api/v1/store-products/:id` - Update product (Admin/Manager)
- `DELETE /api/v1/store-products/:id` - Delete product (Admin)
- `PATCH /api/v1/store-products/:id/restock` - Restock product

### Sales

- `POST /api/v1/store-products/sales/record` - Record sale
- `GET /api/v1/store-products/sales/stats` - Get sales statistics

### Reports

- `GET /api/v1/store-products/reports/profit-loss` - Profit & loss report
- `GET /api/v1/store-products/reports/inventory` - Inventory report
- `GET /api/v1/store-products/reports/best-sellers` - Best selling products

### Inventory

- `GET /api/v1/store-products/inventory/low-stock` - Low stock items
- `GET /api/v1/store-products/inventory/out-of-stock` - Out of stock items

## Measurement Units

### Scale (kg)

- Used for: Chicken, Fish, Turkey, etc.
- Price per kilogram

### Container (mudu)

- Used for: Rice, Beans, Garri, Tomatoes, etc.
- Container sizes: small, medium, large
- Price per mudu

### Other

- Used for: Noodles (packets), Drinks (bottles), Bread (loaves)
- Price per unit

## User Roles

1. **SUPER-ADMIN**: Full system access
2. **ADMIN**: Product management, sales, reports
3. **MANAGER**: Product management, sales recording
4. **STAFF**: Sales recording only
5. **CUSTOMER**: Read-only access (future feature)

## Testing

Run the seed script to populate database with sample Nigerian store products:

```bash
npm run seed
```

Default admin credentials:

- Email: admin@store.com
- Password: admin123

## Deployment

1. Build the project:

```bash
npm run build
```

2. Set production environment variables:

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
```

3. Start the server:

```bash
npm start
```

## License

MIT

```

## **Summary of Added Files:**

1. **`types/storeTypes.ts`** - Shared TypeScript types
2. **`types/express.d.ts`** - Express type extensions
3. **`services/inventoryService.ts`** - Comprehensive inventory management
4. **`utils/validationSchemas.ts`** - Joi validation schemas
5. **`controllers/inventoryController.ts`** - Inventory endpoints
6. **`scripts/seedProducts.ts`** - Nigerian store products seed data
7. **`config/env.ts`** - Environment configuration
8. **`README.md`** - Complete documentation

## **Updated Files:**

1. **All controllers** - Added validation
2. **All routes** - Added new endpoints
3. **Package.json** - Added scripts and dependencies
4. **Server.ts** - Added security and error handling

## **Files to Delete (Redundant):**

1. **`utils/userByToken.ts`** - Replaced by middleware
2. **Any duplicate utility files** - Check for duplicate `buildQuery.ts` or `buildSortQuery.ts`

This complete implementation gives you a production-ready Nigerian store bookkeeping system with all requested features. The system now includes:

✅ **User roles** with proper permissions
✅ **Nigerian measurement units** (scale/kg, container/mudu)
✅ **Sales transactions** with automatic calculation
✅ **Inventory tracking** with low stock alerts
✅ **Profit & loss reports**
✅ **File upload** support
✅ **Validation** for all inputs
✅ **Seed data** with Nigerian products
✅ **API documentation**
✅ **Security** features (helmet, rate limiting, etc.)

Run `npm run seed` to populate your database with sample Nigerian store products, then start the server with `npm run dev`.
```
