'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Users, CheckCircle2 } from 'lucide-react';
import { guildIconUrl } from '@/lib/discord-api';

interface GuildCardProps {
  id: string;
  name: string;
  icon: string | null;
  memberCount?: number;
  featuresEnabled?: number;
  totalFeatures?: number;
  index?: number;
}

export default function GuildCard({ id, name, icon, memberCount, featuresEnabled = 0, totalFeatures = 10, index = 0 }: GuildCardProps) {
  const iconUrl = guildIconUrl(id, icon, 128);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ scale: 1.01 }}
      className="grad-border group"
    >
      <Link href={`/dashboard/servers/${id}`}>
        <div className="glass rounded-[20px] p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={iconUrl}
              alt={name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-violet-500/40 transition-all"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a18]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white truncate group-hover:text-violet-300 transition-colors">{name}</p>
            {memberCount !== undefined && (
              <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3" />
                {memberCount.toLocaleString()} members
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all"
                  style={{ width: `${(featuresEnabled / totalFeatures) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white/30 shrink-0">{featuresEnabled}/{totalFeatures} features</span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}
