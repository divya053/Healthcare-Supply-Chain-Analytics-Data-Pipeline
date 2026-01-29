import { Sidebar } from "@/components/layout/Sidebar";
import { useSuppliers, useCreateSupplier } from "@/hooks/use-supply-chain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Search, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSupplierSchema } from "@shared/schema";

export default function Suppliers() {
  const { data: suppliers } = useSuppliers();
  const [search, setSearch] = useState("");

  const filteredSuppliers = suppliers?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 animate-enter">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
            <p className="text-muted-foreground mt-2">Manage supplier relationships and reliability scores.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search suppliers..." 
                className="pl-9 bg-card border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CreateSupplierDialog />
          </div>
        </header>

        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Supplier Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Reliability Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers?.map((s) => (
                <TableRow key={s.id} className="border-border hover:bg-secondary/20">
                  <TableCell className="font-medium text-white">{s.name}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell className="text-muted-foreground">{s.contactEmail}</TableCell>
                  <TableCell>{s.type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-amber-400">
                      <span className="font-mono text-white mr-1">{s.reliabilityScore}</span>
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
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

function CreateSupplierDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateSupplier();

  const form = useForm({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      location: "",
      contactEmail: "",
      type: "Manufacturer",
      reliabilityScore: "1.0",
    }
  });

  const onSubmit = (data: any) => {
    mutate(data, {
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
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input {...field} className="bg-secondary/50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input {...field} className="bg-secondary/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} className="bg-secondary/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl><Input placeholder="e.g. Manufacturer, Wholesaler" {...field} className="bg-secondary/50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground mt-4">
              {isPending ? "Creating..." : "Create Supplier"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
