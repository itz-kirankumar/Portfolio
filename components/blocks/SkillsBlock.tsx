'use client'
// components/blocks/SkillsBlock.tsx
import type { SkillsContent } from '@/types'

export default function SkillsBlock({ content }: { content: SkillsContent }) {
  const { title, skills, displayStyle = 'bars' } = content

  if (!skills?.length) {
    return (
      <div className="text-white/40 text-center py-12">
        No skills added yet.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="font-syne text-4xl font-bold text-white tracking-tight">
          {title}
        </h2>
      )}

      {/* BAR STYLE - Most Popular */}
      {displayStyle === 'bars' && (
        <div className="space-y-6">
          {skills.map((skill, i) => (
            <div key={i} className="group">
              <div className="flex justify-between mb-2">
                <span className="text-white text-lg font-medium">{skill.name}</span>
                <span className="text-[#7ef0c8] font-mono text-lg font-bold">
                  {skill.level}%
                </span>
              </div>
              <div className="h-2.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7ef0c8] to-[#818cf8] rounded-full transition-all duration-1000 group-hover:brightness-110"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHIPS STYLE */}
      {displayStyle === 'chips' && (
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, i) => (
            <div
              key={i}
              className="px-6 py-3 rounded-2xl text-sm font-medium border transition-all hover:scale-105"
              style={{
                borderColor: (skill.color || '#7ef0c8') + '50',
                color: skill.color || '#7ef0c8',
                backgroundColor: (skill.color || '#7ef0c8') + '10',
              }}
            >
              {skill.name} • {skill.level}%
            </div>
          ))}
        </div>
      )}

      {/* GRID STYLE */}
      {displayStyle === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((skill, i) => (
            <div
              key={i}
              className="bg-[#1a1a24] border border-white/[0.08] rounded-2xl p-6 text-center hover:border-[#7ef0c8]/30 transition-all"
            >
              <div 
                className="text-5xl font-syne font-black mb-2"
                style={{ color: skill.color || '#7ef0c8' }}
              >
                {skill.level}
              </div>
              <div className="text-white/70 text-sm font-medium">{skill.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}