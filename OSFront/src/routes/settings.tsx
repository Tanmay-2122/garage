import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut, User, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  ),
});

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState({ current: "", next: "" });

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const passwordMutation = useMutation({
    mutationFn: () => authService.changePassword(pwd.current, pwd.next),
    onSuccess: () => {
      toast.success("Password updated");
      setPwd({ current: "", next: "" });
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Failed to update password")),
  });

  return (
    <>
      <PageHeader title="Settings" description="Account preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">User Profile</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="font-medium">{user?.role || "—"}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="w-full mt-4">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Change Password</h3>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); passwordMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} required />
            </div>
            <Button type="submit" disabled={passwordMutation.isPending} className="w-full">
              {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
