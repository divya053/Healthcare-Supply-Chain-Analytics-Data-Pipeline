import { Sidebar } from "@/components/layout/Sidebar";
import { useOrders, useCreateOrder, useProducts } from "@/hooks/use-supply-chain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/schema";
import { format } from "date-fns";

export default function Orders() {
  const { data: orders } = useOrders();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 animate-enter">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground mt-2">Track outbound shipments and order history.</p>
          </div>
          <CreateOrderDialog />
        </header>

        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Order ID</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Delivery Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((o) => (
                <TableRow key={o.id} className="border-border hover:bg-secondary/20">
                  <TableCell className="font-mono text-muted-foreground">#{o.id}</TableCell>
                  <TableCell className="text-white">#{o.productId}</TableCell>
                  <TableCell className="font-mono font-bold">{o.quantity}</TableCell>
                  <TableCell><AutoStatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-sm">{format(new Date(o.orderDate!), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.deliveryDate ? format(new Date(o.deliveryDate), 'MMM dd, yyyy') : '-'}
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

function CreateOrderDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateOrder();
  const { data: products } = useProducts();

  const form = useForm({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      productId: 0,
      quantity: 1,
      status: "Pending",
    }
  });

  const onSubmit = (data: any) => {
    mutate({ ...data, productId: Number(data.productId) }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {products?.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl><Input type="number" {...field} className="bg-secondary/50" onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground mt-4">
              {isPending ? "Creating..." : "Place Order"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
