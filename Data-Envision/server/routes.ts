import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Simple ETL simulation function
async function runEtlPipeline(pipelineId: number, runId: number) {
  console.log(`Starting ETL pipeline ${pipelineId}, run ${runId}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // Simulate some logic based on pipeline ID
    // In a real app, this would call Python scripts or Spark jobs
    
    // Random success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      const rows = Math.floor(Math.random() * 1000);
      await storage.updatePipelineRun(runId, {
        status: 'Completed',
        endTime: new Date(),
        rowsProcessed: rows,
        logs: [`[INFO] Extracted ${rows} records`, `[INFO] Transformation successful`, `[INFO] Loaded to Data Warehouse`]
      });
      console.log(`Pipeline ${pipelineId} completed successfully`);
    } else {
      await storage.updatePipelineRun(runId, {
        status: 'Failed',
        endTime: new Date(),
        rowsProcessed: 0,
        logs: [`[INFO] Starting extraction`, `[ERROR] Connection timeout to source system`, `[FATAL] Pipeline aborted`]
      });
      console.log(`Pipeline ${pipelineId} failed`);
    }
  } catch (err) {
    console.error("ETL Error:", err);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Suppliers
  app.get(api.suppliers.list.path, async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post(api.suppliers.create.path, async (req, res) => {
    try {
      const input = api.suppliers.create.input.parse(req.body);
      const supplier = await storage.createSupplier(input);
      res.status(201).json(supplier);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Inventory
  app.get(api.inventory.list.path, async (req, res) => {
    const inventory = await storage.getInventory();
    res.json(inventory);
  });

  app.put(api.inventory.update.path, async (req, res) => {
    try {
      const input = api.inventory.update.input.parse(req.body);
      const updated = await storage.updateInventory(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Orders
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Pipelines
  app.get(api.pipelines.list.path, async (req, res) => {
    const pipelines = await storage.getPipelines();
    res.json(pipelines);
  });

  app.get(api.pipelines.runs.path, async (req, res) => {
    const runs = await storage.getPipelineRuns(Number(req.params.id));
    res.json(runs);
  });

  app.post(api.pipelines.trigger.path, async (req, res) => {
    const pipelineId = Number(req.params.id);
    const run = await storage.createPipelineRun({
      pipelineId,
      status: 'Running',
      logs: ['[INFO] Pipeline execution started'],
      rowsProcessed: 0
    });
    
    // Trigger async simulation
    runEtlPipeline(pipelineId, run.id);
    
    res.status(201).json(run);
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const suppliers = await storage.getSuppliers();
  if (suppliers.length === 0) {
    // Create Suppliers
    const s1 = await storage.createSupplier({ 
      name: "MedLife Pharmaceuticals", 
      location: "New York, USA", 
      contactEmail: "supply@medlife.com", 
      type: "Manufacturer",
      reliabilityScore: "0.98"
    });
    const s2 = await storage.createSupplier({ 
      name: "Global Health Equipment", 
      location: "Berlin, Germany", 
      contactEmail: "sales@ghe.de", 
      type: "Distributor",
      reliabilityScore: "0.95"
    });

    // Create Products
    const p1 = await storage.createProduct({
      name: "Paracetamol 500mg",
      sku: "MED-001",
      category: "Pharmaceuticals",
      unitPrice: "0.05",
      supplierId: s1.id
    });
    const p2 = await storage.createProduct({
      name: "Surgical Masks (N95)",
      sku: "PPE-001",
      category: "PPE",
      unitPrice: "1.20",
      supplierId: s2.id
    });
    const p3 = await storage.createProduct({
      name: "Ventilator Type A",
      sku: "EQP-900",
      category: "Equipment",
      unitPrice: "15000.00",
      supplierId: s2.id
    });

    // Create Inventory
    await storage.createInventory({
      productId: p1.id,
      quantity: 50000,
      warehouseLocation: "Zone A-12",
      minStockLevel: 10000
    });
    await storage.createInventory({
      productId: p2.id,
      quantity: 200, // Low stock!
      warehouseLocation: "Zone B-05",
      minStockLevel: 500
    });
    await storage.createInventory({
      productId: p3.id,
      quantity: 15,
      warehouseLocation: "Zone C-Secure",
      minStockLevel: 5
    });

    // Create Orders
    await storage.createOrder({
      productId: p2.id,
      quantity: 1000,
      status: "Pending"
    });

    // Create Pipelines
    await storage.createPipeline({
      name: "Daily Inventory Sync",
      description: "Syncs inventory levels from warehouse ERP system",
      schedule: "0 0 * * *",
      type: "Batch"
    });
    await storage.createPipeline({
      name: "Supplier Order ETL",
      description: "Extracts orders from supplier portals and loads to data warehouse",
      schedule: "0 */4 * * *",
      type: "Batch"
    });
    
    // Create some initial runs
    const pipelines = await storage.getPipelines();
    if (pipelines.length > 0) {
      await storage.createPipelineRun({
        pipelineId: pipelines[0].id,
        status: "Completed",
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 86400000 + 300000),
        rowsProcessed: 15420,
        logs: ["[INFO] Sync started", "[INFO] Completed successfully"]
      });
    }
  }
}
