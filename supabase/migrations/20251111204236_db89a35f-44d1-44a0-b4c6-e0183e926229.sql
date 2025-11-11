-- Add admin SELECT policy for estimates table to support lead generation dashboard
CREATE POLICY "Admins can view all estimates"
ON public.estimates
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));