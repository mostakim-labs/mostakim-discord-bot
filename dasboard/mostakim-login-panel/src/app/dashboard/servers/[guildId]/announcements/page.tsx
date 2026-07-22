'use client';
import { useState, useEffect, use } from 'react';
import { Megaphone, Send, Clock, Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import ColorPicker from '@/components/ui/ColorPicker';
import EmbedPreview from '@/components/dashboard/EmbedPreview';

export default function AnnouncementsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [channel, setChannel] = useState('');
  const [useEmbed, setUseEmbed] = useState(true);
  const [color, setColor] = useState('#7c3aed');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [footer, setFooter] = useState('');
  const [plainText, setPlainText] = useState('');
  const [schedule, setSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/channels`).then(r => r.json())
      .then(d => setChannels((d.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5 || c.type === 15)));
  }, [guildId]);

  const handleSend = async () => {
    if (!channel) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setTimeout(() => setSent(false), 3000); }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Megaphone className="w-6 h-6 text-teal-400" />}
        iconBg="from-teal-600/20 to-teal-600/5"
        title="Announcements"
        description="Broadcast messages to your server channels"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card gradient title="Message Settings">
            <div className="space-y-4">
              <Select label="Target Channel" value={channel} onChange={setChannel} options={channels.map(c => ({ value: c.id, label: `#${c.name}` }))} placeholder="Select channel" />
              <div className="flex items-center justify-between py-2 border-t border-white/[0.06]">
                <p className="text-sm font-medium text-white/80">Use Embed</p>
                <Toggle enabled={useEmbed} onChange={setUseEmbed} size="sm" />
              </div>
              {useEmbed ? (
                <>
                  <ColorPicker label="Color" value={color} onChange={setColor} />
                  <Input label="Title" value={title} onChange={setTitle} placeholder="Announcement title" />
                  <Input label="Message" value={description} onChange={setDescription} multiline rows={5} placeholder="Your announcement…" />
                  <Input label="Footer" value={footer} onChange={setFooter} placeholder="Optional footer" />
                </>
              ) : (
                <Input label="Plain Message" value={plainText} onChange={setPlainText} multiline rows={6} placeholder="Your announcement…" />
              )}
            </div>
          </Card>

          <Card gradient title="Schedule (Optional)">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Schedule for later</p>
                  <p className="text-xs text-white/40">Send at a specific time</p>
                </div>
                <Toggle enabled={schedule} onChange={setSchedule} size="sm" />
              </div>
              {schedule && (
                <Input label="Send at" type="datetime-local" value={scheduleTime} onChange={setScheduleTime} />
              )}
            </div>
          </Card>

          <button
            onClick={handleSend}
            disabled={!channel || sending}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40"
          >
            {sending ? <Clock className="w-4 h-4 animate-spin" /> : sent ? '✓ Sent!' : <><Send className="w-4 h-4" />{schedule ? 'Schedule Announcement' : 'Send Now'}</>}
          </button>
        </div>

        <Card gradient title="Preview">
          <EmbedPreview
            color={color} title={title} description={description}
            footer={footer} useEmbed={useEmbed} plainMessage={plainText}
          />
        </Card>
      </div>
    </div>
  );
}
