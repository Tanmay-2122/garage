import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDays, Clock, AlertTriangle } from "lucide-react";
import { vehicleService, type Vehicle } from "@/services";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/reminders")({
  component: () => (
    <AppLayout>
      <RemindersPage />
    </AppLayout>
  ),
});

function RemindersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: vehicleService.list,
  });

  const vehicles = data ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueToday: Vehicle[] = [];
  const upcoming: Vehicle[] = [];
  const overdue: Vehicle[] = [];

  vehicles.forEach((v) => {
    if (!v.nextServiceDate) return;
    const d = new Date(v.nextServiceDate);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) dueToday.push(v);
    else if (d.getTime() < today.getTime()) overdue.push(v);
    else upcoming.push(v);
  });

  return (
    <>
      <PageHeader title="Reminders" description="Service schedule across all vehicles" />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ReminderColumn title="Due Today" icon={Clock} tone="primary" items={dueToday} />
          <ReminderColumn title="Upcoming" icon={CalendarDays} tone="accent" items={upcoming} />
          <ReminderColumn title="Overdue" icon={AlertTriangle} tone="destructive" items={overdue} />
        </div>
      )}
    </>
  );
}

function ReminderColumn({ title, icon: Icon, items, tone }: {
  title: string; icon: any; items: Vehicle[]; tone: "primary" | "accent" | "destructive";
}) {
  const toneClass = { primary: "text-primary", accent: "text-accent", destructive: "text-destructive" }[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${toneClass}`} />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? <EmptyState title="Nothing here" /> : items.map((v) => (
          <div key={v.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">{v.vehicleNumber}</span>
            <span className="text-xs text-muted-foreground">{v.nextServiceDate}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
