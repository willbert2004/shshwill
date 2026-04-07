import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Send, Loader2, CheckCircle, Sparkles, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allocationResult, setAllocationResult] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", objectives: "", description: "", keywords: "" });
  const [resubmitId, setResubmitId] = useState<string | null>(null);
  const [resubmitFeedback, setResubmitFeedback] = useState<string | null>(null);

  useEffect(() => { setIsFinished(searchParams.get('finished') === 'true'); }, [searchParams]);

  // Load existing project data for resubmission
  useEffect(() => {
    const rid = searchParams.get('resubmit');
    if (rid && user) {
      setResubmitId(rid);
      supabase.from('projects').select('*').eq('id', rid).eq('student_id', user.id).single().then(({ data }) => {
        if (data) {
          setFormData({
            title: data.title,
            objectives: data.objectives || '',
            description: data.description,
            keywords: (data.keywords || []).join(', '),
          });
          setResubmitFeedback(data.rejection_reason);
        }
      });
    }
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Authentication Required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

      if (resubmitId) {
        // Update existing project and resubmit
        const { error } = await supabase.from('projects').update({
          title: formData.title, description: formData.description, objectives: formData.objectives,
          keywords: keywordsArray, status: 'pending', rejection_reason: null,
        }).eq('id', resubmitId);
        if (error) throw error;
        try {
          const { data: allocData } = await supabase.functions.invoke('smart-allocation', { body: { action: 'auto_allocate_project', projectId: resubmitId } });
          setAllocationResult(allocData);
        } catch (e) { console.error('Auto-allocation failed:', e); }
        setSubmitted(true);
        toast({ title: "Project Resubmitted!" });
      } else {
        const { data: project, error } = await supabase.from('projects').insert({
          title: formData.title, description: formData.description, objectives: formData.objectives,
          student_id: user.id, keywords: keywordsArray, status: isFinished ? 'completed' : 'pending'
        }).select().single();
        if (error) throw error;
        if (!isFinished && project) {
          try {
            const { data: allocData } = await supabase.functions.invoke('smart-allocation', { body: { action: 'auto_allocate_project', projectId: project.id } });
            setAllocationResult(allocData);
          } catch (e) { console.error('Auto-allocation failed:', e); }
        }
        setSubmitted(true);
        toast({ title: isFinished ? "Project Added!" : "Project Submitted!" });
      }
    } catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  if (!user) return <AuthenticatedLayout><div className="text-center py-12"><p>Please log in.</p></div></AuthenticatedLayout>;

  if (submitted) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-2xl mx-auto animate-scale-in">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{isFinished ? "Project Added!" : "Submitted Successfully!"}</h2>
                {!isFinished && allocationResult?.allocated ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Automatically matched to a supervisor based on expertise.</p>
                    <div className="bg-accent/50 rounded-lg p-4 text-left">
                      <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" /><span className="font-semibold text-sm">Match Details</span></div>
                      <p className="text-xs text-muted-foreground">Score: <span className="font-medium text-foreground">{allocationResult.matchScore}%</span></p>
                      <p className="text-xs text-muted-foreground">Reason: <span className="font-medium text-foreground">{allocationResult.matchReason}</span></p>
                    </div>
                  </div>
                ) : !isFinished ? (
                  <p className="text-sm text-muted-foreground">Pending supervisor assignment.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Added to the repository.</p>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/projects')}>View Projects</Button>
                <Button variant="outline" onClick={() => { setSubmitted(false); setAllocationResult(null); setFormData({ title: "", objectives: "", description: "", keywords: "" }); }}>Submit Another</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-3xl mx-auto animate-slide-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{resubmitId ? "Revise & Resubmit" : isFinished ? "Add Finished Project" : "Submit Project Proposal"}</h1>
          <p className="text-sm text-muted-foreground">{resubmitId ? "Address the feedback below, update your project, and resubmit." : isFinished ? "Add a completed project to the repository." : "Submit your proposal — the system will match you to a supervisor."}</p>
        </div>

        {resubmitFeedback && (
          <Card className="mb-6 border-l-4 border-l-destructive">
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" /> Supervisor Feedback
              </div>
              <p className="text-sm text-muted-foreground">{resubmitFeedback}</p>
              <p className="text-xs text-muted-foreground italic">Address this feedback in your revision below, then resubmit.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-lg">Project Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2"><Label>Project Title *</Label><Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Enter your project title" required /></div>
              <div className="space-y-2"><Label>Objectives *</Label><Textarea value={formData.objectives} onChange={e => setFormData({ ...formData, objectives: e.target.value })} placeholder="List the main objectives..." rows={3} required /><p className="text-xs text-muted-foreground">Clearly state what your project aims to achieve.</p></div>
              <div className="space-y-2"><Label>Description *</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe methodology and expected outcomes..." rows={5} required /></div>
              <div className="space-y-2"><Label>Keywords *</Label><Input value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })} placeholder="machine learning, web development, AI" required /><p className="text-xs text-muted-foreground">Critical for supervisor matching. Separate with commas.</p></div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Send className="h-4 w-4 mr-2" />{resubmitId ? "Resubmit Project" : isFinished ? "Add Project" : "Submit & Find Supervisor"}</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
