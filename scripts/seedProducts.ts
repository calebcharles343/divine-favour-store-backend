// scripts/seedProducts.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import StoreProduct from "../src/models/StoreProductModel";
import User from "../src/models/UserModel";

dotenv.config();

// Nigerian store products data - FIXED: Removed 'other' from measurementType
const nigerianStoreProducts = [
  // Protein Category (sold by weight - scale)
  {
    name: "Chicken (Whole)",
    description: "Fresh whole chicken",
    category: "protein" as const,
    measurementType: "scale" as const,
    pricePerUnit: 2500, // per kg
    costPrice: 2000,
    currentStock: 50,
    minStockLevel: 10,
    supplier: "Local Poultry Farm",
  },
  {
    name: "Turkey (Whole)",
    description: "Fresh whole turkey",
    category: "protein" as const,
    measurementType: "scale" as const,
    pricePerUnit: 3500, // per kg
    costPrice: 2800,
    currentStock: 20,
    minStockLevel: 5,
    supplier: "Local Poultry Farm",
  },
  {
    name: "Fish (Tilapia)",
    description: "Fresh tilapia fish",
    category: "protein" as const,
    measurementType: "scale" as const,
    pricePerUnit: 1500, // per kg
    costPrice: 1200,
    currentStock: 100,
    minStockLevel: 20,
    supplier: "Local Fishery",
  },
  {
    name: "Goat Meat",
    description: "Fresh goat meat",
    category: "protein" as const,
    measurementType: "scale" as const,
    pricePerUnit: 3000, // per kg
    costPrice: 2400,
    currentStock: 30,
    minStockLevel: 8,
    supplier: "Local Butcher",
  },

  // Vegetables Category (sold by container)
  {
    name: "Tomatoes",
    description: "Fresh red tomatoes",
    category: "vegetable" as const,
    measurementType: "container" as const,
    containerSize: "medium" as const, // mudu
    pricePerUnit: 500, // per mudu
    costPrice: 350,
    currentStock: 100,
    minStockLevel: 20,
    supplier: "Local Market",
  },
  {
    name: "Peppers",
    description: "Fresh peppers (mix)",
    category: "vegetable" as const,
    measurementType: "container" as const,
    containerSize: "small" as const, // small mudu
    pricePerUnit: 300, // per small mudu
    costPrice: 200,
    currentStock: 80,
    minStockLevel: 15,
    supplier: "Local Market",
  },
  {
    name: "Onions",
    description: "Fresh onions",
    category: "vegetable" as const,
    measurementType: "container" as const,
    containerSize: "large" as const, // large mudu
    pricePerUnit: 800, // per large mudu
    costPrice: 600,
    currentStock: 120,
    minStockLevel: 30,
    supplier: "Local Market",
  },
  {
    name: "Carrots",
    description: "Fresh carrots",
    category: "vegetable" as const,
    measurementType: "container" as const,
    containerSize: "medium" as const,
    pricePerUnit: 400, // per mudu
    costPrice: 280,
    currentStock: 60,
    minStockLevel: 12,
    supplier: "Local Market",
  },

  // Grains Category (sold by container)
  {
    name: "Rice (Local)",
    description: "Local rice",
    category: "grain" as const,
    measurementType: "container" as const,
    containerSize: "medium" as const, // mudu
    pricePerUnit: 400, // per mudu
    costPrice: 300,
    currentStock: 200,
    minStockLevel: 50,
    supplier: "Grain Supplier",
  },
  {
    name: "Beans (Brown)",
    description: "Brown beans",
    category: "grain" as const,
    measurementType: "container" as const,
    containerSize: "medium" as const, // mudu
    pricePerUnit: 450, // per mudu
    costPrice: 350,
    currentStock: 150,
    minStockLevel: 40,
    supplier: "Grain Supplier",
  },
  {
    name: "Garri (Yellow)",
    description: "Yellow garri",
    category: "grain" as const,
    measurementType: "container" as const,
    containerSize: "large" as const, // large mudu
    pricePerUnit: 300, // per large mudu
    costPrice: 220,
    currentStock: 180,
    minStockLevel: 45,
    supplier: "Grain Supplier",
  },
  {
    name: "Maize",
    description: "Dry maize grains",
    category: "grain" as const,
    measurementType: "container" as const,
    containerSize: "medium" as const,
    pricePerUnit: 350, // per mudu
    costPrice: 250,
    currentStock: 120,
    minStockLevel: 30,
    supplier: "Grain Supplier",
  },

  // Spices Category
  {
    name: "Salt",
    description: "Iodized salt",
    category: "spice" as const,
    measurementType: "scale" as const, // Sold by kg for salt
    pricePerUnit: 100, // per kg
    costPrice: 70,
    currentStock: 50,
    minStockLevel: 10,
    supplier: "Spice Supplier",
  },
  {
    name: "Maggi Cubes",
    description: "Seasoning cubes",
    category: "spice" as const,
    measurementType: "scale" as const, // Sold by packet (kg equivalent)
    pricePerUnit: 1200, // per packet of 12 cubes
    costPrice: 900,
    currentStock: 100,
    minStockLevel: 20,
    supplier: "Spice Supplier",
  },
  {
    name: "Curry Powder",
    description: "Curry powder",
    category: "spice" as const,
    measurementType: "scale" as const,
    pricePerUnit: 800, // per kg
    costPrice: 600,
    currentStock: 25,
    minStockLevel: 5,
    supplier: "Spice Supplier",
  },

  // Other Category - Items sold by piece/unit (using 'scale' for unit pricing)
  {
    name: "Indomie Noodles",
    description: "Instant noodles (pack of 5)",
    category: "other" as const,
    measurementType: "scale" as const, // Using 'scale' for unit items
    pricePerUnit: 700, // per pack
    costPrice: 550,
    currentStock: 100,
    minStockLevel: 20,
    supplier: "Distributor",
  },
  {
    name: "Coca Cola (50cl)",
    description: "Soft drink",
    category: "other" as const,
    measurementType: "scale" as const,
    pricePerUnit: 200, // per bottle
    costPrice: 150,
    currentStock: 200,
    minStockLevel: 50,
    supplier: "Beverage Distributor",
  },
  {
    name: "Bread (Sliced)",
    description: "Sliced bread loaf",
    category: "other" as const,
    measurementType: "scale" as const,
    pricePerUnit: 500, // per loaf
    costPrice: 350,
    currentStock: 30,
    minStockLevel: 10,
    supplier: "Local Bakery",
  },
  {
    name: "Eggs (Tray)",
    description: "Fresh eggs (30 pieces)",
    category: "other" as const,
    measurementType: "scale" as const,
    pricePerUnit: 1500, // per tray
    costPrice: 1200,
    currentStock: 40,
    minStockLevel: 8,
    supplier: "Poultry Farm",
  },
];

// Default admin user
const defaultAdmin = {
  firstName: "Super",
  lastName: "Admin",
  email: "admin@store.com",
  password: "admin123",
  role: "SUPER-ADMIN" as const,
  position: "Store Owner",
  phone: "08012345678",
  isActive: true,
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/nigerian-store";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoUri.split("/").pop()}`);

    // Clear existing data
    await StoreProduct.deleteMany({});
    await User.deleteMany({ email: defaultAdmin.email });
    console.log("🧹 Cleared existing data");

    // Create admin user
    const admin = await User.create(defaultAdmin);
    console.log("👑 Created admin user:", admin.email);

    // Add createdBy to all products
    const productsWithCreator = nigerianStoreProducts.map((product) => ({
      ...product,
      createdBy: admin._id,
    }));

    // Insert products
    const products = await StoreProduct.insertMany(productsWithCreator);
    console.log(`📦 Seeded ${products.length} products`);

    // Display summary
    console.log("\n📊 PRODUCTS SUMMARY:");
    console.log("==================");

    const categories = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categories).forEach(([category, count]) => {
      console.log(
        `${
          category.charAt(0).toUpperCase() + category.slice(1)
        }: ${count} items`
      );
    });

    console.log("\n💰 SAMPLE PRODUCTS:");
    console.log("==================");

    // Show a few sample products
    const sampleProducts = products.slice(0, 5);
    sampleProducts.forEach((product, index) => {
      const measurement =
        product.measurementType === "scale"
          ? "per kg"
          : `per ${product.containerSize} mudu`;
      console.log(
        `${index + 1}. ${product.name} - ₦${
          product.pricePerUnit
        } ${measurement}`
      );
    });

    console.log("\n🎉 DATABASE SEEDING COMPLETE!");
    console.log("\n🔑 Admin Login:");
    console.log("   Email: admin@store.com");
    console.log("   Password: admin123");
    console.log("\n🚀 Start the server with: npm run dev");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ ERROR SEEDING DATABASE:");
    console.error("=========================");

    if (error.name === "ValidationError") {
      Object.values(error.errors).forEach((err: any) => {
        console.error(`• ${err.path}: ${err.message}`);
      });
    } else {
      console.error(error.message);
    }

    console.error("\n💡 TROUBLESHOOTING:");
    console.error("1. Check MongoDB is running");
    console.error("2. Verify MONGODB_URI in .env file");
    console.error("3. Check product data format");

    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
