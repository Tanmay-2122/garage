import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { serviceService, type Service } from "@/services";
import { extractErrorMessage } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/services")({
  component: () => (
    <AppLayout>
      <ServicesPage />
    </AppLayout>
  ),
});

function ServicesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Service>({ name: "", price: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: serviceService.list,
  });

  const saveMutation = useMutation({
    mutationFn: (s: Service) => serviceService.create(s),
    onSuccess: () => {
      toast.success("Service added");
      qc.invalidateQueries({ queryKey: ["services"] });
      setOpen(false);
      setForm({ name: "", price: 0 });
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Failed to add service")),
  });

  const items = data ?? [];

  return (
    <>
      <PageHeader
        title="Services"
        description="Service catalog and pricing"
        actions={
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        }
      />

      <div className="glass rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No services yet" description="Add services to your catalog." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Service Name</th>
                  <th className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((s, i) => (
                    <motion.tr
                      key={s.id ?? i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-right text-primary font-semibold">${Number(s.price).toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ ...form, price: Number(form.price) }); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
