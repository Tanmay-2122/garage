import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { vehicleService, customerService, type Vehicle } from "@/services";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/vehicles")({
  component: () => (
    <AppLayout>
      <VehiclesPage />
    </AppLayout>
  ),
});

function VehiclesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["cars", search],
    queryFn: () => (search ? vehicleService.search(search) : vehicleService.list()),
  });

  const customersQ = useQuery({
    queryKey: ["customers"],
    queryFn: customerService.list,
  });

  const saveMutation = useMutation({
    mutationFn: (v: Vehicle) =>
      v.id != null ? vehicleService.update(v.id, v) : vehicleService.create(v),
    onSuccess: () => {
      toast.success("Vehicle saved");
      qc.invalidateQueries({ queryKey: ["cars"] });
      setOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Failed to save vehicle")),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string | number) => vehicleService.markComplete(id),
    onSuccess: () => {
      toast.success("Service marked complete");
      qc.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Failed to mark complete")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => vehicleService.remove(id),
    onSuccess: () => {
      toast.success("Vehicle deleted");
      qc.invalidateQueries({ queryKey: ["cars"] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Failed to delete")),
  });

  const items = data ?? [];
  const customers = customersQ.data ?? [];

  const customerName = (v: Vehicle) =>
    v.customer?.name ||
    customers.find((c) => String(c.id) === String(v.customerId))?.name ||
    "—";

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Track vehicles and service schedules"
        actions={
          <Button
            onClick={() => { setEditing({ vehicleNumber: "" }); setOpen(true); }}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Vehicle
          </Button>
        }
      />

      <div className="glass rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No vehicles yet" description="Add a vehicle to begin tracking." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Vehicle Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service Date</th>
                  <th className="px-4 py-3">Next Service</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((v) => (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{v.vehicleNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{customerName(v)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.serviceDate || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.nextServiceDate || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => completeMutation.mutate(v.id!)} title="Mark service complete">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setEditing(v); setOpen(true); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(v.id!)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
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
          <DialogHeader>
            <DialogTitle>{editing?.id != null ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Vehicle Number</Label>
                <Input required value={editing.vehicleNumber} onChange={(e) => setEditing({ ...editing, vehicleNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={editing.customerId != null ? String(editing.customerId) : ""}
                  onValueChange={(v) => setEditing({ ...editing, customerId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId != null && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground"
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
