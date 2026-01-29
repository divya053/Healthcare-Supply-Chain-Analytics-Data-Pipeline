import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertSupplier, InsertProduct, InsertOrder } from "@shared/schema";

// ============================================
// SUPPLIERS
// ============================================
export function useSuppliers() {
  return useQuery({
    queryKey: [api.suppliers.list.path],
    queryFn: async () => {
      const res = await fetch(api.suppliers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      return api.suppliers.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const validated = api.suppliers.create.input.parse(data);
      const res = await fetch(api.suppliers.create.path, {
        method: api.suppliers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create supplier");
      return api.suppliers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.suppliers.list.path] }),
  });
}

// ============================================
// PRODUCTS
// ============================================
export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      // Ensure numeric types are coerced correctly if coming from raw form inputs
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create product");
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

// ============================================
// INVENTORY
// ============================================
export function useInventory() {
  return useQuery({
    queryKey: [api.inventory.list.path],
    queryFn: async () => {
      const res = await fetch(api.inventory.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.inventory.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const url = buildUrl(api.inventory.update.path, { id });
      const res = await fetch(url, {
        method: api.inventory.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update inventory");
      return api.inventory.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] }),
  });
}

// ============================================
// ORDERS
// ============================================
export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertOrder) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create order");
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.orders.list.path] }),
  });
}

// ============================================
// PIPELINES
// ============================================
export function usePipelines() {
  return useQuery({
    queryKey: [api.pipelines.list.path],
    queryFn: async () => {
      const res = await fetch(api.pipelines.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pipelines");
      return api.pipelines.list.responses[200].parse(await res.json());
    },
  });
}

export function usePipelineRuns(pipelineId: number) {
  return useQuery({
    queryKey: [api.pipelines.runs.path, pipelineId],
    queryFn: async () => {
      const url = buildUrl(api.pipelines.runs.path, { id: pipelineId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch runs");
      return api.pipelines.runs.responses[200].parse(await res.json());
    },
    enabled: !!pipelineId,
    refetchInterval: 5000, // Poll for updates while viewing runs
  });
}

export function useTriggerPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.pipelines.trigger.path, { id });
      const res = await fetch(url, {
        method: api.pipelines.trigger.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to trigger pipeline");
      return api.pipelines.trigger.responses[201].parse(await res.json());
    },
    onSuccess: (_, id) => {
      // Invalidate both the runs list for this pipeline and dashboard stats
      queryClient.invalidateQueries({ queryKey: [api.pipelines.runs.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

// ============================================
// DASHBOARD
// ============================================
export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Refresh dashboard stats every 10s
  });
}
