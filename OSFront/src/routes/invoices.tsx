import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  invoiceService, customerService, serviceService,
} from "@/services";
import { extractErrorMessage } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/invoices")({
  component: () => (
    <AppLayout>
      <InvoicesPage />
    </AppLayout>
  ),
});

function InvoicesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const invoices = useQuery({ queryKey: ["invoices"], queryFn: invoiceService.list });
  const customers = useQuery({ queryKey: ["customers"], queryFn: customerService.list });
  const services = useQuery({ queryKey: ["services"], queryFn: serviceService.list });

  const total = useMemo(() => {
    const list = services.data ?? [];
    return list
      .filter((s) => selectedServices.has(String(s.id)))
      .reduce((sum, s) => sum + Number(s.price || 0), 0);
  }, [services.data, selectedServices]);

  const createMutation = useMutation({
    mutationFn: () =>
      invoiceService.create({
        customerId,
        serviceIds: [...selectedServices],
        totalAmount: total,
      }),
    onSuccess: () => {
      toast.success("Invoice created");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setOpen(false);
      setCustomerId("");
      setSelectedServices(new Set());
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Failed to create invoice")),
  });

  const items = invoices.data ?? [];
  const customerName = (id: any) =>
    (customers.data ?? []).find((c) => String(c.id) === String(id))?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Create and review customer invoices"
        actions={
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Create Invoice
          </Button>
        }
      />

      <div className="glass rounded-2xl shadow-card overflow-hidden">
        {invoices.isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No invoices yet" description="Create your first invoice." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Invoice ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((inv, i) => (
                    <motion.tr
                      key={inv.id ?? i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">#{inv.id ?? i + 1}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {inv.customer?.name || customerName(inv.customerId)}
                      </td>
                      <td className="px-4 py-3 text-right text-primary font-semibold">
                        ${Number(inv.totalAmount || inv.total || 0).toFixed(2)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!customerId || selectedServices.size === 0) {
                toast.error("Select a customer and at least one service");
                return;
              }
              createMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {(customers.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Services</Label>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border/40 divide-y divide-border/40">
                {(services.data ?? []).map((s) => {
                  const id = String(s.id);
                  const checked = selectedServices.has(id);
                  return (
                    <label key={id} className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const next = new Set(selectedServices);
                            if (c) next.add(id); else next.delete(id);
                            setSelectedServices(next);
                          }}
                        />
                        <span className="text-sm font-medium">{s.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">${Number(s.price).toFixed(2)}</span>
                    </label>
                  );
                })}
                {(services.data ?? []).length === 0 && (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">No services available</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
