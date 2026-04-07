import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Shield, AlertTriangle, CheckCircle, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: string; title: string; description: string; similarity_score: number;
  is_duplicate: boolean; keywords: string[]; created_at: string; calculated_similarity?: number;
}

export default function DuplicateDetection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkText, setCheckText] = useState({ title: "", objectives: "", description: "" });
  const [similarProjects, setSimilarProjects] = useState<Project[]>([]);
  const [checkResult, setCheckResult] = useState<{ message: string; isDuplicate: boolean; isNewSubmission: boolean } | null>(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('similarity_score', { ascending: false });
    setProjects(data || []);
  };

  const checkSimilarity = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!checkText.title.trim() || !checkText.objectives.trim() || !checkText.description.trim()) { toast({ title: "Missing Info", description: "Title, objectives, and description are all required.", variant: "destructive" }); return; }
    setLoading(true); setSimilarProjects([]); setCheckResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-duplicate', { body: { title: checkText.title, objectives: checkText.objectives, description: checkText.description } });
      if (error) throw error;
      setCheckResult({ message: data.message, isDuplicate: data.isDuplicate, isNewSubmission: data.isNewSubmission });
      setSimilarProjects((data.similarProjects || []).map((p: any) => ({ ...p, calculated_similarity: p.similarity, keywords: [], created_at: new Date().toISOString(), similarity_score: p.similarity, is_duplicate: false })));
      toast({ title: data.isDuplicate ? "Duplicate Detected" : "Check Complete", variant: data.isDuplicate ? "destructive" : "default" });
      fetchProjects();
    } catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        <div>
          <div className="flex items-center gap-3 mb-1"><Shield className="h-6 w-6 text-primary" /><h1 className="text-2xl font-bold">Duplicate Detection</h1></div>
          <p className="text-sm text-muted-foreground">Check if your project idea is similar to existing projects.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Projects', value: projects.length, icon: Shield, gradient: 'from-primary to-primary-light' },
            { label: 'Duplicates', value: projects.filter(p => p.is_duplicate).length, icon: AlertTriangle, gradient: 'from-destructive to-[hsl(0,80%,65%)]' },
            { label: 'Unique', value: `${Math.round(((projects.length - projects.filter(p => p.is_duplicate).length) / Math.max(projects.length, 1)) * 100)}%`, icon: CheckCircle, gradient: 'from-success to-[hsl(160,80%,45%)]' },
          ].map((s, i) => (
            <Card key={i} className="group hover-lift cursor-default overflow-hidden border-transparent shadow-card hover:shadow-hover transition-all duration-300">
              <CardContent className="pt-5 flex items-center justify-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Check Form */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Check Your Project Idea</CardTitle><CardDescription>Enter title and description to check for duplicates.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Project Title *</Label><Input value={checkText.title} onChange={e => setCheckText({ ...checkText, title: e.target.value })} placeholder="Enter title" required /></div>
            <div className="space-y-2"><Label>Objectives *</Label><Textarea value={checkText.objectives} onChange={e => setCheckText({ ...checkText, objectives: e.target.value })} placeholder="List the main objectives of your project..." rows={3} required /><p className="text-xs text-muted-foreground">Objectives are critical for accurate duplicate detection.</p></div>
            <div className="space-y-2"><Label>Description *</Label><Textarea value={checkText.description} onChange={e => setCheckText({ ...checkText, description: e.target.value })} placeholder="Describe your project methodology and expected outcomes..." rows={4} required /></div>
            <Button onClick={checkSimilarity} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Checking...</> : <><Search className="h-4 w-4 mr-2" />Check for Duplicates</>}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {checkResult && (
          <Card className={`border-2 ${checkResult.isDuplicate ? 'border-destructive/30' : 'border-success/30'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {checkResult.isDuplicate ? <AlertTriangle className="h-5 w-5 text-warning" /> : <CheckCircle className="h-5 w-5 text-success" />}
                {checkResult.isDuplicate ? 'Potential Duplicates Found' : 'Check Complete'}
              </CardTitle>
              <CardDescription>{checkResult.message}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Similar Projects */}
        {similarProjects.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Similar Projects</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {similarProjects.map(p => (
                <div key={p.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{p.title}</h3>
                    <Badge variant={p.calculated_similarity! > 70 ? "destructive" : p.calculated_similarity! > 50 ? "outline" : "secondary"}>
                      {p.calculated_similarity}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground text-xs">Similarity:</span>
                    <Progress value={p.calculated_similarity} className="h-2 flex-1 max-w-32" />
                    <span className="font-medium text-xs">{p.calculated_similarity}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
