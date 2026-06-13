import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Handlers = {
  onInsert?: (row: any) => void;
  onUpdate?: (row: any) => void;
  onDelete?: (row: any) => void;
};

export function useRealtimeTable(table: string, userId: string | undefined, handlers: Handlers) {
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`rt-${table}-${userId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table, filter: `user_id=eq.${userId}` }, (p) => handlers.onInsert?.(p.new))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table, filter: `user_id=eq.${userId}` }, (p) => handlers.onUpdate?.(p.new))
      .on("postgres_changes", { event: "DELETE", schema: "public", table, filter: `user_id=eq.${userId}` }, (p) => handlers.onDelete?.(p.old))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId]);
}
