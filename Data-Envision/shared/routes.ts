import { z } from 'zod';
import { 
  insertSupplierSchema, 
  insertProductSchema, 
  insertInventorySchema, 
  insertOrderSchema,
  insertPipelineSchema,
  suppliers,
  products,
  inventory,
  orders,
  pipelines,
  pipelineRuns
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  suppliers: {
    list: {
      method: 'GET' as const,
      path: '/api/suppliers',
      responses: {
        200: z.array(z.custom<typeof suppliers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/suppliers',
      input: insertSupplierSchema,
      responses: {
        201: z.custom<typeof suppliers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  inventory: {
    list: {
      method: 'GET' as const,
      path: '/api/inventory',
      responses: {
        200: z.array(z.custom<typeof inventory.$inferSelect & { product: typeof products.$inferSelect }>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/inventory/:id',
      input: insertInventorySchema.partial(),
      responses: {
        200: z.custom<typeof inventory.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  pipelines: {
    list: {
      method: 'GET' as const,
      path: '/api/pipelines',
      responses: {
        200: z.array(z.custom<typeof pipelines.$inferSelect>()),
      },
    },
    runs: {
      method: 'GET' as const,
      path: '/api/pipelines/:id/runs',
      responses: {
        200: z.array(z.custom<typeof pipelineRuns.$inferSelect>()),
      },
    },
    trigger: {
      method: 'POST' as const,
      path: '/api/pipelines/:id/trigger',
      responses: {
        201: z.custom<typeof pipelineRuns.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalSuppliers: z.number(),
          totalProducts: z.number(),
          lowStockItems: z.number(),
          pendingOrders: z.number(),
          activePipelines: z.number(),
          pipelineHealth: z.number(),
        }),
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
