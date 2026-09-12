import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocalDb, saveLocalDb } from './mockStorage';
import { LiveStream, StreamPlatform, StreamStatus } from '../types';

export async function getLiveStream(): Promise<LiveStream | null> {
  const db = getLocalDb();
  let stream = db.liveStreams[0] || null;

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('live_streams').select('*').single();
    if (data) stream = data as LiveStream;
  }

  return stream;
}

export function convertToEmbedUrl(url: string, platform: StreamPlatform): string {
  if (!url) return '';
  if (url.includes('embed')) return url;

  if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
    }
  }

  if (platform === 'kick' || url.includes('kick.com')) {
    const channelName = url.split('kick.com/')[1]?.split('/')[0] || '';
    if (channelName) {
      return `https://player.kick.com/${channelName}`;
    }
  }

  return url;
}

export async function updateLiveStream(data: {
  platform: StreamPlatform;
  stream_url: string;
  title: string;
  status: StreamStatus;
}): Promise<LiveStream> {
  const db = getLocalDb();
  const embedUrl = convertToEmbedUrl(data.stream_url, data.platform);
  const now = new Date().toISOString();

  const stream: LiveStream = {
    id: db.liveStreams[0]?.id || `stream-${Date.now()}`,
    tournament_id: '00000000-0000-0000-0000-000000000001',
    platform: data.platform,
    stream_url: data.stream_url.trim(),
    embed_url: embedUrl,
    title: data.title.trim(),
    status: data.status,
    created_at: db.liveStreams[0]?.created_at || now,
    updated_at: now
  };

  db.liveStreams = [stream];
  saveLocalDb(db);

  if (isSupabaseConfigured) {
    await supabase.from('live_streams').upsert(stream);
  }

  return stream;
}
