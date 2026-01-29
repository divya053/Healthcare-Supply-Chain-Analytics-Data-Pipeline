import { db } from "./db";
import {
  suppliers, products, inventory, orders, pipelines, pipelineRuns,
  type Supplier, type InsertSupplier,
  type Product, type InsertProduct,
  type InventoryItem, type InsertInventory,
  type Order, type InsertOrder,
  type Pipeline, type InsertPipeline,
  type PipelineRun, type InsertPipelineRun,
  type DashboardStats
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Inventory
  getInventory(): Promise<(InventoryItem & { product: Product })[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  updateInventory(id: number, updates: Partial<InsertInventory>): Promise<InventoryItem>;
  createInventory(item: InsertInventory): Promise<InventoryItem>;

  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Pipelines
  getPipelines(): Promise<Pipeline[]>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  getPipelineRuns(pipelineId: number): Promise<PipelineRun[]>;
  createPipelineRun(run: InsertPipelineRun): Promise<PipelineRun>;
  updatePipelineRun(id: number, updates: Partial<InsertPipelineRun>): Promise<PipelineRun>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Inventory
  async getInventory(): Promise<(InventoryItem & { product: Product })[]> {
    const result = await db
      .select({
        inventory: inventory,
        product: products,
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id));
    
    return result.map(row => ({
      ...row.inventory,
      product: row.product
    }));
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async updateInventory(id: number, updates: Partial<InsertInventory>): Promise<InventoryItem> {
    const [updated] = await db.update(inventory)
      .set(updates)
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  async createInventory(item: InsertInventory): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.orderDate));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  // Pipelines
  async getPipelines(): Promise<Pipeline[]> {
    return await db.select().from(pipelines);
  }

  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const [newPipeline] = await db.insert(pipelines).values(pipeline).returning();
    return newPipeline;
  }

  async getPipelineRuns(pipelineId: number): Promise<PipelineRun[]> {
    return await db.select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.pipelineId, pipelineId))
      .orderBy(desc(pipelineRuns.startTime));
  }

  async createPipelineRun(run: InsertPipelineRun): Promise<PipelineRun> {
    const [newRun] = await db.insert(pipelineRuns).values(run).returning();
    return newRun;
  }

  async updatePipelineRun(id: number, updates: Partial<InsertPipelineRun>): Promise<PipelineRun> {
    const [updated] = await db.update(pipelineRuns)
      .set(updates)
      .where(eq(pipelineRuns.id, id))
      .returning();
    return updated;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const [supplierCount] = await db.select({ count: sql<number>`count(*)` }).from(suppliers);
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'Pending'));
    const [pipelineCount] = await db.select({ count: sql<number>`count(*)` }).from(pipelineRuns).where(eq(pipelineRuns.status, 'Running'));
    
    // Low stock items: quantity < minStockLevel
    const [lowStock] = await db.select({ count: sql<number>`count(*)` })
      .from(inventory)
      .where(sql`${inventory.quantity} < ${inventory.minStockLevel}`);

    // Pipeline health (last 10 runs success rate)
    const recentRuns = await db.select().from(pipelineRuns).orderBy(desc(pipelineRuns.startTime)).limit(10);
    const successCount = recentRuns.filter(r => r.status === 'Completed').length;
    const health = recentRuns.length > 0 ? (successCount / recentRuns.length) * 100 : 100;

    return {
      totalSuppliers: Number(supplierCount.count),
      totalProducts: Number(productCount.count),
      lowStockItems: Number(lowStock.count),
      pendingOrders: Number(orderCount.count),
      activePipelines: Number(pipelineCount.count),
      pipelineHealth: Math.round(health),
    };
  }
}

export const storage = new DatabaseStorage();
