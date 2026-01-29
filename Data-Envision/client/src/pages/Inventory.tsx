import { Sidebar } from "@/components/layout/Sidebar";
import { useInventory, useProducts, useUpdateInventory } from "@/hooks/use-supply-chain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Package, AlertTriangle, Edit2 } from "lucide-react";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const { data: inventory, isLoading } = useInventory();
  const [search, setSearch] = useState("");

  const filteredInventory = inventory?.filter(item => 
    item.product.name.toLowerCase().includes(search.toLowerCase()) ||
    item.warehouseLocation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 animate-enter">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
            <p className="text-muted-foreground mt-2">Track stock levels across all warehouse locations.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-card border-border focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[100px]">Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Min Level</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInventory?.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-secondary/20">
                  <TableCell className="font-mono text-muted-foreground">#{item.productId}</TableCell>
                  <TableCell className="font-medium text-white">{item.product.name}</TableCell>
                  <TableCell className="font-mono text-xs">{item.product.sku}</TableCell>
                  <TableCell>{item.warehouseLocation}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono">
                    {item.minStockLevel}
                  </TableCell>
                  <TableCell className="text-center">
                    <AutoStatusBadge status={item.quantity < item.minStockLevel ? "Low Stock" : "In Stock"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <EditInventoryDialog item={item} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

function EditInventoryDialog({ item }: { item: any }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUpdateInventory();
  
  const form = useForm({
    defaultValues: { quantity: item.quantity },
  });

  const onSubmit = (data: { quantity: number }) => {
    mutate({ id: item.id, quantity: Number(data.quantity) }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Update Inventory Level</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity for {item.product.name}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      className="bg-secondary/50 border-border"
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
                {isPending ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
