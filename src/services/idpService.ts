import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDb, saveLocalDb } from './mockStorage';
import { IdpDocument } from '../types';
import { generateUuid } from '../utils/codeGenerator';

export async function getAllIdps(): Promise<IdpDocument[]> {
  const db = getLocalDb();
  let idps = db.idps;
  let supabaseRounds: any[] = [];
  let supabaseGroups: any[] = [];

  if (isSupabaseConfigured) {
    const { data: iData } = await supabase.from('idps').select('*').order('created_at', { ascending: false });
    const { data: rData } = await supabase.from('rounds').select('*');
    const { data: gData } = await supabase.from('groups').select('*');

    if (iData) idps = iData as IdpDocument[];
    if (rData) supabaseRounds = rData;
    if (gData) supabaseGroups = gData;
  }

  const allRounds = isSupabaseConfigured && supabaseRounds.length > 0 ? supabaseRounds : db.rounds;
  const allGroups = isSupabaseConfigured && supabaseGroups.length > 0 ? supabaseGroups : db.groups;

  return idps.map(i => {
    const round = allRounds.find(r => r.id === i.round_id);
    const group = allGroups.find(g => g.id === i.group_id);
    return {
      ...i,
      round_name: round ? round.name : 'Round',
      group_name: group ? group.group_name : 'Group'
    };
  });
}

export async function uploadAndPublishIdp(
  roundId: string,
  groupId: string,
  title: string,
  file?: File | null,
  externalUrl?: string
): Promise<{ success: boolean; idp?: IdpDocument; error?: string }> {
  const db = getLocalDb();
  const round = db.rounds.find(r => r.id === roundId);
  const group = db.groups.find(g => g.id === groupId);

  let fileUrl = externalUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  let filePath = `idp/round-${roundId}/group-${groupId}/${title.replace(/\s+/g, '_')}.pdf`;
  const fileType = file ? file.name.split('.').pop() || 'pdf' : 'pdf';

  if (file && isSupabaseConfigured) {
    const storagePath = `idp/round-${roundId}/group-${groupId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('idp')
      .upload(storagePath, file, { upsert: true });

    if (!uploadError) {
      filePath = storagePath;
      const { data: publicUrlData } = supabase.storage.from('idp').getPublicUrl(storagePath);
      fileUrl = publicUrlData.publicUrl;
    }
  }

  const existingIdx = db.idps.findIndex(i => i.round_id === roundId && i.group_id === groupId);
  const now = new Date().toISOString();
  let idpId = existingIdx >= 0 ? db.idps[existingIdx].id : generateUuid();

  if (isSupabaseConfigured) {
    const { data: existingSupabaseIdp } = await supabase
      .from('idps')
      .select('id')
      .eq('round_id', roundId)
      .eq('group_id', groupId)
      .maybeSingle();
    if (existingSupabaseIdp) {
      idpId = existingSupabaseIdp.id;
    }
  }

  const newIdp: IdpDocument = {
    id: idpId,
    tournament_id: '00000000-0000-0000-0000-000000000001',
    round_id: roundId,
    group_id: groupId,
    title: title.trim(),
    file_path: filePath,
    file_url: fileUrl,
    file_type: fileType,
    is_published: true,
    created_at: existingIdx >= 0 ? db.idps[existingIdx].created_at : now,
    updated_at: now
  };

  if (existingIdx >= 0) {
    db.idps[existingIdx] = newIdp;
  } else {
    db.idps.unshift(newIdp);
  }

  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('tournaments').upsert(db.tournament);
    if (round) await supabase.from('rounds').upsert(round);
    if (group) await supabase.from('groups').upsert(group);

    const { error } = await supabase.from('idps').upsert(newIdp);
    if (error) console.error('Error upserting IDP in Supabase:', error);
  }

  return { 
    success: true, 
    idp: {
      ...newIdp,
      round_name: round ? round.name : 'Round',
      group_name: group ? group.group_name : 'Group'
    }
  };
}

export async function deleteIdp(idpId: string): Promise<boolean> {
  const db = getLocalDb();
  db.idps = db.idps.filter(i => i.id !== idpId);
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('idps').delete().eq('id', idpId);
  }
  return true;
}
