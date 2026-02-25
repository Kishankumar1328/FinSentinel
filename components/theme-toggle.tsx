'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

const OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!mounted) {
        return (
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 animate-pulse" />
        );
    }

    const CurrentIcon = resolvedTheme === 'dark' ? Moon : resolvedTheme === 'light' ? Sun : Monitor;

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Toggle theme"
                className={`
          relative p-2.5 rounded-xl border transition-all duration-200
          ${open
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400'
                        : 'bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:border-white/15 hover:text-white/80'
                    }
        `}
            >
                <Sun className={`h-4 w-4 absolute transition-all duration-300 ${resolvedTheme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} />
                <Moon className={`h-4 w-4 absolute transition-all duration-300 ${resolvedTheme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                <Monitor className={`h-4 w-4 transition-all duration-300 ${theme === 'system' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="
          absolute right-0 top-full mt-2 w-44 z-50
          rounded-2xl border border-white/10
          bg-[oklch(0.12_0.015_265/0.95)] backdrop-blur-2xl
          shadow-2xl shadow-black/50
          overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-150
        ">
                    <div className="p-1.5 space-y-0.5">
                        {OPTIONS.map(({ value, label, icon: Icon }) => {
                            const active = theme === value;
                            return (
                                <button
                                    key={value}
                                    onClick={() => { setTheme(value); setOpen(false); }}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150 text-left
                    ${active
                                            ? 'bg-indigo-500/20 text-indigo-300'
                                            : 'text-white/55 hover:bg-white/8 hover:text-white/80'
                                        }
                  `}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-indigo-500/25' : 'bg-white/6'}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span>{label}</span>
                                    {active && <Check className="h-3.5 w-3.5 ml-auto text-indigo-400" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom label */}
                    <div className="border-t border-white/6 px-4 py-2">
                        <p className="text-[10px] text-white/20 font-medium">
                            {theme === 'system' ? `System: ${resolvedTheme}` : `Active: ${theme}`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
