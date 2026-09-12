import type { ReactNode } from 'react';

type SectionTabProps = {
    icon: ReactNode;
    label: string;
    selected?: boolean;
    onClick?: () => void;
};

export function SectionTab({
    icon,
    label,
    selected = false,
    onClick,
}: SectionTabProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex h-10 items-center gap-2 rounded px-4',
                'text-xs font-semibold uppercase',
                selected
                    ? 'bg-slate-300 text-white shadow-sm'
                    : 'bg-transparent text-slate-700',
            ].join(' ')}
        >
            {icon}
            {label}
        </button>
    );
}