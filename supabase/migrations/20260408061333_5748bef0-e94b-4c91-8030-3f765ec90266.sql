
CREATE POLICY "Anyone can view schools for signup"
ON public.schools FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can view departments for signup"
ON public.departments FOR SELECT TO anon, authenticated USING (true);
