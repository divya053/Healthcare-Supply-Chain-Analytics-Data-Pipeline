import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// 1. Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  contactEmail: text("contact_email").notNull(),
  type: text("type").notNull(), // Manufacturer, Distributor, Wholesaler
  reliabilityScore: decimal("reliability_score").default("1.0"), // 0.0 to 1.0
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(), // Pharmaceuticals, Equipment, PPE
  unitPrice: decimal("unit_price").notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(0),
  warehouseLocation: text("warehouse_location").notNull(),
  minStockLevel: integer("min_stock_level").notNull().default(100),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// 4. Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull(), // Pending, Shipped, Delivered, Cancelled
  orderDate: timestamp("order_date").defaultNow(),
  deliveryDate: timestamp("delivery_date"),
});

// 5. Pipelines (Metadata about available pipelines)
export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  schedule: text("schedule"), // Cron expression or description
  type: text("type").notNull(), // Batch, Streaming
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Pipeline Runs (Execution logs)
export const pipelineRuns = pgTable("pipeline_runs", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").references(() => pipelines.id).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull(), // Running, Completed, Failed
  rowsProcessed: integer("rows_processed").default(0),
  logs: jsonb("logs"), // Array of log strings or objects
});

// === RELATIONS ===
export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  inventory: many(inventory),
  orders: many(orders),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

export const pipelineRunsRelations = relations(pipelineRuns, ({ one }) => ({
  pipeline: one(pipelines, {
    fields: [pipelineRuns.pipelineId],
    references: [pipelines.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, lastUpdated: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderDate: true });
export const insertPipelineSchema = createInsertSchema(pipelines).omit({ id: true, createdAt: true });
export const insertPipelineRunSchema = createInsertSchema(pipelineRuns).omit({ id: true, startTime: true, endTime: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;

export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type InsertPipelineRun = z.infer<typeof insertPipelineRunSchema>;

// Request types
export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;
export type UpdateInventoryRequest = Partial<InsertInventory>;

// Dashboard Stats
export interface DashboardStats {
  totalSuppliers: number;
  totalProducts: number;
  lowStockItems: number;
  pendingOrders: number;
  activePipelines: number;
  pipelineHealth: number; // Percentage success rate
}
