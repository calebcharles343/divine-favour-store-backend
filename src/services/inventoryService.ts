// services/inventoryService.ts
import StoreProduct, { IStoreProduct } from "../models/StoreProductModel";
import SalesTransaction from "../models/SalesTransactionModel";
import { InventoryReport, PeriodType } from "../types/storeTypes";

class InventoryService {
  /**
   * Check for low stock products
   */
  async checkLowStock(): Promise<IStoreProduct[]> {
    return await StoreProduct.find({
      $expr: { $lte: ["$currentStock", "$minStockLevel"] },
      isActive: true,
    }).select(
      "name currentStock minStockLevel category pricePerUnit costPrice"
    );
  }

  /**
   * Get out of stock products
   */
  async getOutOfStock(): Promise<IStoreProduct[]> {
    return await StoreProduct.find({
      currentStock: 0,
      isActive: true,
    }).select("name category pricePerUnit costPrice");
  }

  /**
   * Update stock levels for multiple products
   */
  async updateStockLevels(
    updates: Array<{
      productId: string;
      quantity: number;
      operation: "add" | "subtract";
    }>
  ): Promise<void> {
    const bulkOperations = updates.map((update) => {
      const amount =
        update.operation === "add" ? update.quantity : -update.quantity;

      return {
        updateOne: {
          filter: { _id: update.productId, isActive: true },
          update: {
            $inc: { currentStock: amount },
            $set: { updatedAt: new Date() },
          },
        },
      };
    });

    if (bulkOperations.length > 0) {
      await StoreProduct.bulkWrite(bulkOperations);
    }
  }

  /**
   * Get comprehensive inventory report
   */
  async getInventoryReport(): Promise<InventoryReport> {
    const [products, lowStock, outOfStock] = await Promise.all([
      StoreProduct.find({ isActive: true }),
      this.checkLowStock(),
      this.getOutOfStock(),
    ]);

    const totalValue = products.reduce((sum, product) => {
      return sum + product.currentStock * product.costPrice;
    }, 0);

    return {
      totalProducts: products.length,
      totalValue,
      lowStockItems: lowStock.map((item) => ({
        name: item.name,
        currentStock: item.currentStock,
        minStockLevel: item.minStockLevel,
      })),
      outOfStockItems: outOfStock.map((item) => ({
        name: item.name,
      })),
    };
  }

  /**
   * Get stock movement history
   */
  async getStockMovement(productId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await SalesTransaction.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.product": productId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    return sales;
  }

  /**
   * Get best selling products
   */
  async getBestSellingProducts(limit: number = 10, period?: PeriodType) {
    let startDate = new Date();

    if (period) {
      switch (period) {
        case "daily":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "weekly":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "monthly":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "yearly":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
    }

    const bestSellers = await SalesTransaction.aggregate([
      { $unwind: "$items" },
      { $match: period ? { createdAt: { $gte: startDate } } : {} },
      {
        $lookup: {
          from: "storeproducts",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$product.name" },
          category: { $first: "$product.category" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
          totalCost: {
            $sum: { $multiply: ["$items.quantity", "$product.costPrice"] },
          },
          totalProfit: {
            $sum: {
              $subtract: [
                "$items.totalPrice",
                { $multiply: ["$items.quantity", "$product.costPrice"] },
              ],
            },
          },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
    ]);

    return bestSellers;
  }

  /**
   * Restock a product
   */
  async restockProduct(
    productId: string,
    quantity: number,
    newCostPrice?: number,
    newPricePerUnit?: number
  ): Promise<IStoreProduct> {
    const product = await StoreProduct.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    // Update stock
    product.currentStock += quantity;

    // Update prices if provided
    if (newCostPrice !== undefined) {
      product.costPrice = newCostPrice;
    }

    if (newPricePerUnit !== undefined) {
      product.pricePerUnit = newPricePerUnit;
    }

    product.updatedAt = new Date();

    return await product.save();
  }
}

export default new InventoryService();
