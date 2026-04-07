import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import GroupManagement from "@/components/GroupManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function StudentGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    checkAccess();
  }, [user, navigate]);

  const checkAccess = async () => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("user_type").eq("user_id", user!.id).single();
      if (error) throw error;
      if (profile.user_type !== 'student') {
        toast({ title: "Access denied", description: "Students only", variant: "destructive" });
        navigate("/"); return;
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (loading) return <AuthenticatedLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AuthenticatedLayout>;

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold">My Groups</h1>
          <p className="text-sm text-muted-foreground">Create and manage your project groups</p>
        </div>
        <GroupManagement />
      </div>
    </AuthenticatedLayout>
  );
}
