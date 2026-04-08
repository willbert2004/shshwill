
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_user_type();

CREATE OR REPLACE TRIGGER on_profile_updated_sync_supervisors
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_supervisors();

CREATE OR REPLACE TRIGGER on_profile_updated_sync_students
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_students();

CREATE OR REPLACE TRIGGER on_profile_updated_sync_group_members
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_group_members();

CREATE OR REPLACE TRIGGER on_profile_change_audit
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

CREATE OR REPLACE TRIGGER on_role_change_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();

CREATE OR REPLACE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER set_updated_at_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER set_updated_at_student_groups BEFORE UPDATE ON public.student_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER set_updated_at_supervisors BEFORE UPDATE ON public.supervisors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER set_updated_at_students BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER set_updated_at_meetings BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER set_updated_at_group_milestones BEFORE UPDATE ON public.group_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER on_feedback_notify_student
  AFTER INSERT ON public.supervisor_feedback
  FOR EACH ROW EXECUTE FUNCTION public.notify_student_on_feedback();

CREATE OR REPLACE TRIGGER on_milestone_notify_group
  AFTER INSERT ON public.group_milestones
  FOR EACH ROW EXECUTE FUNCTION public.notify_group_on_milestone();

CREATE OR REPLACE TRIGGER on_allocation_notify_supervisor
  AFTER INSERT ON public.group_allocations
  FOR EACH ROW EXECUTE FUNCTION public.notify_supervisor_on_allocation();

CREATE OR REPLACE TRIGGER on_allocation_response_notify_student
  AFTER UPDATE ON public.group_allocations
  FOR EACH ROW EXECUTE FUNCTION public.notify_student_on_allocation_response();

CREATE OR REPLACE TRIGGER on_meeting_notify_group
  AFTER INSERT ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.notify_group_on_meeting();

CREATE OR REPLACE TRIGGER on_project_update_revision
  AFTER UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.create_project_revision();

CREATE OR REPLACE TRIGGER on_project_update_supervisor_count
  AFTER INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_supervisor_project_count();
