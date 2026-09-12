import React, { useState, useEffect } from 'react';
import { getLiveStream } from '../../services/streamService';
import { LiveStream } from '../../types';
import { Radio, ExternalLink, Tv, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const LiveBroadcastPage: React.FC = () => {
  const [stream, setStream] = useState<LiveStream | null>(null);

  useEffect(() => {
    getLiveStream().then(setStream);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-surface-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {stream?.status === 'live' ? (
              <Badge variant="live">🔴 LIVE NOW</Badge>
            ) : (
              <Badge variant="default">Official Stream</Badge>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Live Broadcast Hub</h1>
          <p className="text-sm text-surface-500 mt-1">Watch live tournament matches, caster commentary, and replay highlights.</p>
        </div>

        {stream?.stream_url && (
          <a
            href={stream.stream_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Open on {stream.platform === 'kick' ? 'Kick.com' : 'YouTube'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Stream Player Area */}
      {!stream || !stream.embed_url ? (
        <EmptyState
          icon={Tv}
          title="No Live Broadcast Active"
          description="Tournament streams will appear here during scheduled match hours."
        />
      ) : (
        <div className="space-y-6">
          
          {/* Iframe Video Container */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-surface-300">
            <iframe
              src={stream.embed_url}
              title={stream.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Stream Information Card */}
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-surface-900">{stream.title}</h2>
              <p className="text-xs text-surface-500 mt-1">
                Platform: <span className="capitalize font-semibold text-surface-800">{stream.platform}</span> • Official REX Esports Broadcast
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-surface-100 rounded-lg text-xs font-bold text-surface-700 border border-surface-200">
                1080p 60FPS Stream
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

