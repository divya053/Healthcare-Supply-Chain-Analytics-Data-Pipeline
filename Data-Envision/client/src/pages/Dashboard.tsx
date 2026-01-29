import { useDashboardStats, useInventory, usePipelines, usePipelineRuns } from "@/hooks/use-supply-chain";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Truck, Workflow, AlertTriangle, ArrowUpRight, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: inventory } = useInventory();
  const { data: pipelines } = usePipelines();
  
  // Transform inventory for chart
  const inventoryData = inventory?.slice(0, 8).map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    minStock: item.minStockLevel,
    isLow: item.quantity < item.minStockLevel
  })) || [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 animate-enter">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
          <p className="text-muted-foreground mt-2">Real-time supply chain analytics and pipeline monitoring.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Products" 
            value={stats?.totalProducts} 
            icon={Package} 
            loading={statsLoading} 
            trend="+12%"
          />
          <StatCard 
            title="Pending Orders" 
            value={stats?.pendingOrders} 
            icon={Truck} 
            loading={statsLoading}
            alert={stats?.pendingOrders > 10}
          />
          <StatCard 
            title="Active Pipelines" 
            value={stats?.activePipelines} 
            icon={Workflow} 
            loading={statsLoading}
          />
          <StatCard 
            title="Pipeline Health" 
            value={stats ? `${stats.pipelineHealth}%` : undefined} 
            icon={Activity} 
            loading={statsLoading}
            trendClass="text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory Health Chart */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle>Inventory Health</CardTitle>
              <CardDescription>Stock levels vs Minimum requirements</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {inventory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                    <Bar dataKey="quantity" radius={[0, 4, 4, 0]} barSize={24}>
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isLow ? '#ef4444' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Pipelines */}
          <Card className="glass-card flex flex-col">
            <CardHeader>
              <CardTitle>Pipeline Status</CardTitle>
              <CardDescription>Recent ETL executions</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pr-2">
              <div className="space-y-4">
                {pipelines?.map(pipeline => (
                  <PipelineRow key={pipeline.id} pipeline={pipeline} />
                ))}
                {!pipelines && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, alert, trend, trendClass }: any) {
  return (
    <Card className={`border-l-4 ${alert ? 'border-l-destructive' : 'border-l-primary'} glass-card hover:-translate-y-1 transition-transform duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 ${alert ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold font-mono text-white">
            {loading ? <Skeleton className="h-8 w-16" /> : value ?? 0}
          </div>
          {trend && (
            <div className={`text-xs flex items-center ${trendClass || 'text-emerald-400'}`}>
              {trend} <ArrowUpRight className="ml-1 h-3 w-3" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineRow({ pipeline }: { pipeline: any }) {
  // We fetch runs just for display status here - simplified for dashboard
  const { data: runs } = usePipelineRuns(pipeline.id);
  const lastRun = runs?.[0];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
            lastRun?.status === 'Failed' ? 'bg-destructive/20 text-destructive' : 
            lastRun?.status === 'Running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 
            'bg-primary/20 text-primary'
          }`}>
          <Workflow className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{pipeline.name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {lastRun ? format(new Date(lastRun.startTime!), 'HH:mm dd/MM') : 'No runs'}
          </p>
        </div>
      </div>
      <AutoStatusBadge status={lastRun?.status || 'Idle'} />
    </div>
  );
}
