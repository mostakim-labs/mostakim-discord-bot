'use client';

interface EmbedField { name: string; value: string; inline: boolean }
interface Button { label: string; url: string; emoji?: string }

interface EmbedPreviewProps {
  color: string;
  title: string;
  description: string;
  footer?: string;
  thumbnail?: boolean;
  bannerUrl?: string;
  fields?: EmbedField[];
  authorName?: string;
  useEmbed: boolean;
  plainMessage?: string;
  buttons?: Button[];
  timestamp?: boolean;
}

function applyVars(text: string) {
  return text
    .replace(/\{user\}/g, '@User')
    .replace(/\{username\}/g, 'Username')
    .replace(/\{mention\}/g, '<@000000000>')
    .replace(/\{server\}/g, 'Server Name')
    .replace(/\{memberCount\}/g, '1,234');
}

export default function EmbedPreview({
  color, title, description, footer, thumbnail, bannerUrl,
  fields = [], useEmbed, plainMessage, buttons = [], timestamp, authorName,
}: EmbedPreviewProps) {
  if (!useEmbed) {
    return (
      <div className="bg-[#313338] rounded-xl p-4 font-sans">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">B</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold text-sm">MOSTAKIM BOT</span>
              <span className="text-[10px] text-[#5865F2] bg-[#5865F2]/20 px-1.5 py-0.5 rounded font-semibold">APP</span>
            </div>
            <p className="text-[#dcddde] text-sm">{applyVars(plainMessage || '')}</p>
          </div>
        </div>
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pl-13">
            {buttons.map((btn, i) => (
              <div key={i} className="flex items-center gap-1 bg-[#5865F2] text-white text-xs px-3 py-1.5 rounded font-medium cursor-default">
                {btn.emoji && <span>{btn.emoji}</span>}
                {btn.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#313338] rounded-xl p-4 font-sans">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">B</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-semibold text-sm">MOSTAKIM BOT</span>
            <span className="text-[10px] text-[#5865F2] bg-[#5865F2]/20 px-1.5 py-0.5 rounded font-semibold">APP</span>
          </div>
          {/* Embed */}
          <div
            className="rounded overflow-hidden max-w-lg"
            style={{ borderLeft: `4px solid ${color}`, backgroundColor: '#2b2d31' }}
          >
            {bannerUrl && (
              <img src={bannerUrl} alt="Banner" className="w-full h-24 object-cover opacity-70" onError={e => (e.currentTarget.style.display = 'none')} />
            )}
            <div className="p-3 flex gap-3">
              <div className="flex-1 min-w-0">
                {authorName && <p className="text-white/60 text-xs mb-1 font-medium">{authorName}</p>}
                {title && <p className="text-white font-bold text-sm mb-1">{applyVars(title)}</p>}
                {description && (
                  <p className="text-[#dbdee1] text-xs whitespace-pre-wrap leading-relaxed">{applyVars(description)}</p>
                )}
                {fields.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {fields.map((f, i) => (
                      <div key={i} className={f.inline ? '' : 'col-span-3'}>
                        <p className="text-white text-xs font-bold">{applyVars(f.name)}</p>
                        <p className="text-[#dbdee1] text-xs">{applyVars(f.value)}</p>
                      </div>
                    ))}
                  </div>
                )}
                {footer && (
                  <p className="text-[#87898c] text-xs mt-2 pt-2 border-t border-white/10">
                    {applyVars(footer)}{timestamp && ` · ${new Date().toLocaleDateString()}`}
                  </p>
                )}
              </div>
              {thumbnail && (
                <div className="w-16 h-16 rounded-lg bg-violet-600/30 flex items-center justify-center shrink-0 text-violet-400 text-xs font-bold">
                  Avatar
                </div>
              )}
            </div>
          </div>
          {buttons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {buttons.map((btn, i) => (
                <div key={i} className="flex items-center gap-1 bg-[#5865F2] text-white text-xs px-3 py-1.5 rounded font-medium cursor-default">
                  {btn.emoji && <span>{btn.emoji}</span>}
                  {btn.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
