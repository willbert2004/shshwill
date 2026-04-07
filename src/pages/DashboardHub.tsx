import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderKanban, ClipboardList, Users, Archive, Shield, Sparkles,
  BarChart3, UserCog, ArrowRight, Clock, Loader2, Video, CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MeetingScheduler } from "@/components/MeetingScheduler";
import { UpcomingMeetings } from "@/components/UpcomingMeetings";
import { useProjectStats } from "@/hooks/useProjectStats";
import { SupervisorAllocatedGroups } from "@/components/SupervisorAllocatedGroups";
import { StudentSupervisorDetails } from "@/components/StudentSupervisorDetails";

const DashboardHub = () => {
  const { user, loading } = useAuth();
  const { isAdmin, isSuperAdmin, isSupervisor, isStudent, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { stats: projectStats, loading: projectStatsLoading } = useProjectStats();
  const [groupCount, setGroupCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOverview = async () => {
      try {
        const [
          { count: groups }, { data: recent },
        ] = await Promise.all([
          supabase.from("student_groups").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("id, title, status, is_duplicate, created_at").order("created_at", { ascending: false }).limit(20),
        ]);
        setGroupCount(groups || 0);
        setRecentProjects(recent || []);
      } catch (e) { console.error(e); }
      finally { setLoadingData(false); }
    };
    fetchOverview();
  }, [user]);

  if (loading || roleLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const studentActions = [
    { label: "My Projects", icon: FolderKanban, href: "/projects", gradient: "from-primary to-primary-light", iconColor: "text-primary-foreground" },
    { label: "Create Project", icon: ClipboardList, href: "/create-project", gradient: "from-secondary to-secondary-light", iconColor: "text-secondary-foreground" },
    { label: "Student Groups", icon: Users, href: "/student-groups", gradient: "from-[hsl(var(--accent-gold))] to-[hsl(40,90%,65%)]", iconColor: "text-accent-gold-foreground" },
    { label: "Repository", icon: Archive, href: "/repository", gradient: "from-success to-[hsl(160,80%,45%)]", iconColor: "text-success-foreground" },
  ];

  const supervisorActions = [
    { label: "Assigned Projects", icon: FolderKanban, href: "/projects", gradient: "from-primary to-primary-light", iconColor: "text-primary-foreground" },
    { label: "Orchestration", icon: ClipboardList, href: "/project-management", gradient: "from-secondary to-secondary-light", iconColor: "text-secondary-foreground" },
    { label: "Duplicates", icon: Shield, href: "/duplicate-detection", gradient: "from-destructive to-[hsl(0,80%,65%)]", iconColor: "text-destructive-foreground" },
    { label: "Allocation", icon: Sparkles, href: "/allocation", gradient: "from-[hsl(var(--accent-gold))] to-[hsl(40,90%,65%)]", iconColor: "text-accent-gold-foreground" },
    { label: "Repository", icon: Archive, href: "/repository", gradient: "from-success to-[hsl(160,80%,45%)]", iconColor: "text-success-foreground" },
  ];

  const superAdminDashActions = [
    { label: "Dashboard", icon: BarChart3, href: "/admin", gradient: "from-super-admin to-super-admin-light", iconColor: "text-super-admin-foreground" },
    { label: "Users", icon: UserCog, href: "/user-management", gradient: "from-secondary to-secondary-light", iconColor: "text-secondary-foreground" },
    { label: "Create Admin", icon: BarChart3, href: "/user-management?tab=create-admin", gradient: "from-[hsl(var(--accent-gold))] to-[hsl(40,90%,65%)]", iconColor: "text-accent-gold-foreground" },
    { label: "Projects", icon: FolderKanban, href: "/projects", gradient: "from-success to-[hsl(160,80%,45%)]", iconColor: "text-success-foreground" },
    { label: "Analytics", icon: BarChart3, href: "/analytics", gradient: "from-primary-dark to-primary", iconColor: "text-primary-foreground" },
  ];

  const regularAdminDashActions = [
    { label: "Dashboard", icon: BarChart3, href: "/admin", gradient: "from-primary to-primary-light", iconColor: "text-primary-foreground" },
    { label: "Projects", icon: FolderKanban, href: "/projects", gradient: "from-[hsl(var(--accent-gold))] to-[hsl(40,90%,65%)]", iconColor: "text-accent-gold-foreground" },
    { label: "Orchestration", icon: Shield, href: "/project-management", gradient: "from-secondary to-secondary-light", iconColor: "text-secondary-foreground" },
    { label: "Duplicates", icon: Shield, href: "/duplicate-detection", gradient: "from-destructive to-[hsl(0,80%,65%)]", iconColor: "text-destructive-foreground" },
    { label: "Allocation", icon: Sparkles, href: "/allocation", gradient: "from-[hsl(var(--accent-gold))] to-[hsl(40,90%,65%)]", iconColor: "text-accent-gold-foreground" },
    { label: "Analytics", icon: BarChart3, href: "/analytics", gradient: "from-success to-[hsl(160,80%,45%)]", iconColor: "text-success-foreground" },
    { label: "Repository", icon: Archive, href: "/repository", gradient: "from-primary-dark to-primary", iconColor: "text-primary-foreground" },
  ];

  const actions = isSuperAdmin ? superAdminDashActions : isAdmin ? regularAdminDashActions : isSupervisor ? supervisorActions : studentActions;

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-success/10 text-success border-success/30";
      case "pending": return "bg-warning/10 text-warning border-warning/30";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/30";
      case "duplicate": return "bg-destructive/10 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const roleName = isSuperAdmin ? "Super Administrator" : isAdmin ? "Project Administrator" : isSupervisor ? "Supervisor" : "Student";

  const statCards = [
    { label: "Total Projects", value: projectStats.total, icon: FolderKanban, gradient: "from-primary to-primary-light", iconColor: "text-primary-foreground" },
    { label: "Approved", value: projectStats.approved, icon: CheckCircle, gradient: "from-success to-[hsl(160,80%,45%)]", iconColor: "text-success-foreground" },
    { label: "Pending", value: projectStats.pending, icon: Clock, gradient: "from-[hsl(var(--accent-gold))] to-[hsl(40,90%,65%)]", iconColor: "text-accent-gold-foreground" },
    { label: "Finalized", value: projectStats.finalized, icon: FolderKanban, gradient: "from-secondary to-secondary-light", iconColor: "text-secondary-foreground" },
    { label: "Groups", value: groupCount, icon: Users, gradient: "from-primary-dark to-primary", iconColor: "text-primary-foreground" },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 animate-slide-up">
        {/* Welcome */}
        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent p-5 border border-primary/10">
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {user.email?.split("@")[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome to CIIOS — your {roleName.toLowerCase()} hub
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {statCards.map((stat, i) => (
            <Card key={i} className="hover-lift group cursor-default overflow-hidden border-transparent shadow-card hover:shadow-hover transition-all duration-300">
              <CardContent className="p-3 flex items-center gap-3 relative">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none">{loadingData ? "—" : stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {actions.map((action, i) => (
                <button
                  key={i}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 hover:shadow-card transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(action.href)}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient} shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}>
                    <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supervisor: Show allocated groups & projects */}
        {isSupervisor && <SupervisorAllocatedGroups />}

        {/* Student: Show supervisor details */}
        {isStudent && <StudentSupervisorDetails />}

        {/* Meetings Section */}
        {isSupervisor && <MeetingScheduler />}
        {isStudent && <UpcomingMeetings />}

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <CardDescription>Latest project submissions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => navigate("/projects")}>
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No projects yet</p>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-3">
                  <TabsTrigger value="all">All ({projectStats.total})</TabsTrigger>
                  {projectStats.approved > 0 && (
                    <TabsTrigger value="approved">Approved ({projectStats.approved})</TabsTrigger>
                  )}
                  {projectStats.pending > 0 && (
                    <TabsTrigger value="pending">Pending ({projectStats.pending})</TabsTrigger>
                  )}
                  {projectStats.finalized > 0 && (
                    <TabsTrigger value="finalized">Finalized ({projectStats.finalized})</TabsTrigger>
                  )}
                  {projectStats.duplicates > 0 && (
                    <TabsTrigger value="duplicates">⚠️ Duplicates ({projectStats.duplicates})</TabsTrigger>
                  )}
                </TabsList>
                {["all", "approved", "pending", "finalized", "duplicates"].map(tab => (
                  <TabsContent key={tab} value={tab}>
                    <div className="space-y-2">
                      {recentProjects
                        .filter(p => tab === "all" ? true : tab === "duplicates" ? p.is_duplicate : p.status === tab)
                        .map((project) => (
                          <div
                            key={project.id}
                            className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            onClick={() => navigate("/projects")}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary to-primary-light shadow-sm">
                                <FolderKanban className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{project.title}</span>
                            </div>
                            <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColor(project.is_duplicate ? 'duplicate' : project.status)}`}>
                              {project.is_duplicate ? 'Duplicate' : project.status}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default DashboardHub;
