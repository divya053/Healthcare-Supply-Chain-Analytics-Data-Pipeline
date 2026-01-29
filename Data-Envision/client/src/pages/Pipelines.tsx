import { Sidebar } from "@/components/layout/Sidebar";
import { usePipelines, usePipelineRuns, useTriggerPipeline } from "@/hooks/use-supply-chain";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCw, History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Pipelines() {
  const { data: pipelines } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);

  // Default select first pipeline when data loads
  if (pipelines && pipelines.length > 0 && !selectedPipelineId) {
    setSelectedPipelineId(pipelines[0].id);
  }

  const selectedPipeline = pipelines?.find(p => p.id === selectedPipelineId);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 animate-enter">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">ETL Pipelines</h2>
            <p className="text-muted-foreground mt-2">Manage and monitor data processing jobs.</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Pipeline List */}
          <div className="col-span-4 space-y-4 overflow-y-auto pr-2">
            {pipelines?.map(pipeline => (
              <div 
                key={pipeline.id}
                onClick={() => setSelectedPipelineId(pipeline.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer",
                  selectedPipelineId === pipeline.id 
                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">{pipeline.name}</h3>
                  <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-muted-foreground">
                    {pipeline.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {pipeline.description}
                </p>
                <div className="flex items-center text-xs text-muted-foreground font-mono">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {pipeline.schedule || "Manual Trigger"}
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Details & Runs */}
          <div className="col-span-8 bg-card rounded-2xl border border-border p-6 flex flex-col shadow-2xl">
            {selectedPipeline ? (
              <PipelineDetailView pipeline={selectedPipeline} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a pipeline to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PipelineDetailView({ pipeline }: { pipeline: any }) {
  const { data: runs } = usePipelineRuns(pipeline.id);
  const { mutate: trigger, isPending: isTriggering } = useTriggerPipeline();

  const handleRun = () => {
    trigger(pipeline.id);
  };

  return (
    <>
      <div className="flex justify-between items-start mb-8 border-b border-border/50 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{pipeline.name}</h2>
          <p className="text-muted-foreground">{pipeline.description}</p>
        </div>
        <Button 
          onClick={handleRun} 
          disabled={isTriggering}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
        >
          {isTriggering ? <RotateCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Run Pipeline
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <History className="w-4 h-4" /> Run History
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {runs?.map((run) => (
            <div key={run.id} className="bg-secondary/30 rounded-lg p-4 border border-border/50 hover:bg-secondary/50 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <StatusIcon status={run.status} />
                  <div>
                    <span className="text-sm font-mono text-white block">
                      Run #{run.id.toString().padStart(4, '0')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(run.startTime!), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                  </div>
                </div>
                <AutoStatusBadge status={run.status} />
              </div>
              
              <div className="bg-black/40 rounded p-3 font-mono text-xs text-slate-300 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Rows Processed:</span>
                  <span>{run.rowsProcessed}</span>
                </div>
                {run.endTime && (
                  <div className="flex justify-between text-slate-500">
                    <span>Duration:</span>
                    <span>{((new Date(run.endTime).getTime() - new Date(run.startTime!).getTime()) / 1000).toFixed(2)}s</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5 mt-2">
                  <p className="text-slate-400">LOGS:</p>
                  {(run.logs as any[])?.map((log, i) => (
                    <div key={i} className="pl-2 border-l-2 border-slate-700 mt-1">
                      {typeof log === 'string' ? log : JSON.stringify(log)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {(!runs || runs.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              No runs recorded for this pipeline yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "Completed") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === "Failed") return <XCircle className="w-5 h-5 text-destructive" />;
  if (status === "Running") return <RotateCw className="w-5 h-5 text-blue-500 animate-spin" />;
  return <Clock className="w-5 h-5 text-slate-500" />;
}
