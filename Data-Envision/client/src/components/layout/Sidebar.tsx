import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Workflow, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipelines", label: "Pipelines", icon: Workflow },
  { href: "/inventory", label: "Inventory", icon: Box },
  { href: "/products", label: "Products", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/orders", label: "Orders", icon: Truck },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Workflow className="w-6 h-6 text-primary" />
          DataFlow
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">SUPPLY CHAIN OS v1.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
              JS
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">John Smith</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
