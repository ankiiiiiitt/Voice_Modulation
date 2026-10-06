import React, { useState } from 'react';
import { Search, X, Sparkles, Check } from 'lucide-react';
import { SPEECH_TAG_CATEGORIES, TagCategory } from '../data/voices';

interface TagPaletteProps {
  onInsertTag: (tag: string) => void;
  className?: string;
  isCompact?: boolean;
}

export const TagPalette: React.FC<TagPaletteProps> = ({
  onInsertTag,
  className = '',
  isCompact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyInserted, setRecentlyInserted] = useState<string | null>(null);

  const filteredCategories: TagCategory[] = SPEECH_TAG_CATEGORIES.map((cat) => {
    if (!searchQuery.trim()) return cat;
    const query = searchQuery.toLowerCase().replace(/[\[\]]/g, '');
    const filteredTags = cat.tags.filter((tag) =>
      tag.toLowerCase().includes(query)
    );
    return {
      ...cat,
      tags: filteredTags,
    };
  }).filter((cat) => cat.tags.length > 0);

  const handleTagClick = (tag: string) => {
    onInsertTag(tag);
    setRecentlyInserted(tag);
    setTimeout(() => {
      setRecentlyInserted((prev) => (prev === tag ? null : prev));
    }, 1200);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5 shadow-lg space-y-4 ${className}`}
    >
      {/* Search Input matching uploaded image */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags"
          className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {/* Tag Categories */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No tags found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-400 tracking-wide">
                  {category.name}
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  {category.tags.length}
                </span>
              </div>

              {/* Tag Pill Buttons styled matching the image */}
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag) => {
                  const isJustInserted = recentlyInserted === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      title={`Click to insert ${tag} into script`}
                      className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1 active:scale-95 ${
                        isJustInserted
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/25 font-bold'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span>{tag}</span>
                      {isJustInserted && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Helpful Hint */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Click any tag to insert at cursor
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          Gemini 3.8 & ElevenLabs Tags
        </span>
      </div>
    </div>
  );
};
