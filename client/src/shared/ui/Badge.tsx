type StatusBadgeProps = {
    children: React.ReactNode;
    strong?: boolean;
};

export function StatusBadge({
    children,
    strong = false,
}: StatusBadgeProps) {
    return (
        <span
            className={[
                'inline-flex h-10 items-center rounded-md px-4 text-sm',
                strong
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 text-slate-600',
            ].join(' ')}
        >
            {children}
        </span>
    );
}