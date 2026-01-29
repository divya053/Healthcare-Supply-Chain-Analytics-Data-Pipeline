import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/Dashboard";
import Pipelines from "@/pages/Pipelines";
import Inventory from "@/pages/Inventory";
import Products from "@/pages/Products";
import Suppliers from "@/pages/Suppliers";
import Orders from "@/pages/Orders";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pipelines" component={Pipelines} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/products" component={Products} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/orders" component={Orders} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
