-- Add indexes for project_related_items to ensure optimal query performance for project metrics and thesis relations
CREATE INDEX IF NOT EXISTS idx_project_related_items_project_id ON public.project_related_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_related_items_item ON public.project_related_items(item_type, item_id);
