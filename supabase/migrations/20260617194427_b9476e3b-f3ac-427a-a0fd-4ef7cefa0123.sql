
CREATE TABLE public.chatbot_inboxes (
  inbox_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatbot_inboxes TO authenticated;
GRANT ALL ON public.chatbot_inboxes TO service_role;

ALTER TABLE public.chatbot_inboxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage chatbot inboxes"
  ON public.chatbot_inboxes
  FOR ALL
  TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE TRIGGER update_chatbot_inboxes_updated_at
  BEFORE UPDATE ON public.chatbot_inboxes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.chatbot_inboxes (inbox_id, name, active) VALUES (99, 'Aliança-META', true)
ON CONFLICT (inbox_id) DO NOTHING;
