import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export function useSupabaseRealtime(
  tables: string[],
  onUpdate: (payload?: any) => void
) {
  useEffect(() => {
    // 1. Supabase Realtime Channels (When connected to live Supabase)
    if (isSupabaseConfigured) {
      const channels = tables.map(table => {
        return supabase
          .channel(`realtime_${table}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table },
            (payload) => {
              console.log(`⚡ Realtime update received on ${table}:`, payload);
              onUpdate(payload);
            }
          )
          .subscribe();
      });

      return () => {
        channels.forEach(ch => supabase.removeChannel(ch));
      };
    }

    // 2. Local Window Event Listener for seamless tab sync when using local storage mode
    const handleLocalSync = () => {
      onUpdate();
    };

    window.addEventListener('rex_db_updated', handleLocalSync);
    return () => {
      window.removeEventListener('rex_db_updated', handleLocalSync);
    };
  }, [tables, onUpdate]);
}
