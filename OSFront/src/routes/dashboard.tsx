import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Car, Wrench, FileText, DollarSign, Plus, Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { customerService, vehicleService, serviceService, invoiceService } from "@/services";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ),
});

function Dashboard() {
  const customers = useQuery({ queryKey: ["customers"], queryFn: customerService.list });
  const cars = useQuery({ queryKey: ["cars"], queryFn: vehicleService.list });
  const services = useQuery({ queryKey: ["services"], queryFn: serviceService.list });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: invoiceService.list });

  const customersData = customers.data ?? [];
  const carsData = cars.data ?? [];
  const servicesData = services.data ?? [];
  const invoicesData = invoices.data ?? [];

  const totalRevenue = invoicesData.reduce(
    (sum, inv) => sum + Number(inv.totalAmount || inv.total || 0),
    0,
  );

  const loading =
    customers.isLoading || cars.isLoading || services.isLoading || invoices.isLoading;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your garage operations"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/customers"><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Customer</Button></Link>
            <Link to="/vehicles"><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Vehicle</Button></Link>
            <Link to="/services"><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Service</Button></Link>
            <Link to="/invoices">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Invoice
              </Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Customers" value={customersData.length} icon={Users} delay={0} />
          <StatCard label="Vehicles" value={carsData.length} icon={Car} delay={0.05} />
          <StatCard label="Services" value={servicesData.length} icon={Wrench} delay={0.1} />
          <StatCard label="Invoices" value={invoicesData.length} icon={FileText} delay={0.15} />
          <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} delay={0.2} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Recent Customers" link="/customers">
          {customersData.slice(0, 5).map((c, i) => (
            <Row key={c.id ?? i} primary={c.name} secondary={c.email || c.phone} />
          ))}
          {customersData.length === 0 && <Empty text="No customers yet" />}
        </Panel>

        <Panel title="Service Reminders" link="/reminders" icon={Bell}>
          {carsData
            .filter((v) => v.nextServiceDate)
            .slice(0, 5)
            .map((v, i) => (
              <Row
                key={v.id ?? i}
                primary={v.vehicleNumber}
                secondary={`Next: ${v.nextServiceDate}`}
              />
            ))}
          {carsData.filter((v) => v.nextServiceDate).length === 0 && (
            <Empty text="No upcoming reminders" />
          )}
        </Panel>

        <Panel title="Recent Invoices" link="/invoices">
          {invoicesData.slice(0, 5).map((inv, i) => (
            <Row
              key={inv.id ?? i}
              primary={`Invoice #${inv.id ?? i + 1}`}
              secondary={`$${Number(inv.totalAmount || inv.total || 0).toFixed(2)}`}
            />
          ))}
          {invoicesData.length === 0 && <Empty text="No invoices yet" />}
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, link, children, icon: Icon }: { title: string; link?: string; children: React.ReactNode; icon?: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <h3 className="font-semibold">{title}</h3>
        </div>
        {link && <Link to={link as string} className="text-xs text-primary hover:underline">View all</Link>}
      </div>
      <div className="space-y-2">{children}</div>
    </motion.div>
  );
}

function Row({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <span className="text-sm font-medium truncate">{primary}</span>
      {secondary && <span className="text-xs text-muted-foreground truncate ml-2">{secondary}</span>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-6">{text}</p>;
}
