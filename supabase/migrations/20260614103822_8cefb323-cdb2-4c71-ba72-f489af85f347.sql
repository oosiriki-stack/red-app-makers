-- ============ WORKSPACE ROLE ENUM ============
DO $$ BEGIN
  CREATE TYPE public.workspace_role AS ENUM ('owner','admin','member','viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============ WORKSPACES ============
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ============ WORKSPACE MEMBERS ============
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Helper to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = _workspace AND user_id = _user)
$$;

CREATE OR REPLACE FUNCTION public.workspace_role_of(_workspace uuid, _user uuid)
RETURNS public.workspace_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.workspace_members WHERE workspace_id = _workspace AND user_id = _user LIMIT 1
$$;

-- ============ WORKSPACE INVITATIONS ============
CREATE TABLE public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'member',
  token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | revoked | expired
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_invitations TO authenticated;
GRANT ALL ON public.workspace_invitations TO service_role;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- ============ SOCIAL HANDLES ============
CREATE TABLE public.social_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL, -- x | facebook | instagram | linkedin | tiktok | youtube | other
  handle text NOT NULL,
  url text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, handle)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_handles TO authenticated;
GRANT ALL ON public.social_handles TO service_role;
ALTER TABLE public.social_handles ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES: WORKSPACES ============
CREATE POLICY "Owners and members read workspaces" ON public.workspaces
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR public.is_workspace_member(id, auth.uid()));

CREATE POLICY "Users create own workspaces" ON public.workspaces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update workspaces" ON public.workspaces
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete workspaces" ON public.workspaces
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- ============ POLICIES: WORKSPACE MEMBERS ============
CREATE POLICY "Members read membership of their workspaces" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_workspace_member(workspace_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
  );

CREATE POLICY "Owners and admins manage members" ON public.workspace_members
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
    OR public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
    OR public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
  );

-- ============ POLICIES: INVITATIONS ============
CREATE POLICY "Workspace admins read invitations" ON public.workspace_invitations
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
    OR public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
  );

CREATE POLICY "Workspace admins create invitations" ON public.workspace_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
      OR public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
    )
  );

CREATE POLICY "Workspace admins update invitations" ON public.workspace_invitations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
    OR public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
  );

-- ============ POLICIES: SOCIAL HANDLES ============
CREATE POLICY "Users read own social handles" ON public.social_handles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users manage own social handles" ON public.social_handles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============ TRIGGERS updated_at ============
CREATE TRIGGER trg_workspaces_updated BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_social_handles_updated BEFORE UPDATE ON public.social_handles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ AUTO-ADD OWNER AS MEMBER ============
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_workspace_owner_member AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();