import { ExpandMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { ReactNode } from 'react';

type SectionHeadingProps = {
    icon: ReactNode;
    title: string;
    actions?: ReactNode;
    collapsible?: boolean;
};

export function SectionHeading({
    icon,
    title,
    actions,
    collapsible = true,
}: SectionHeadingProps) {
    return (
        <div className="mt-8 flex items-start justify-between">
            <div>
                <div className="flex items-center gap-2 text-slate-800">
                    {icon}

                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    {collapsible && (
                        <IconButton size="small">
                            <ExpandMore fontSize="small" />
                        </IconButton>
                    )}
                </div>

                <div className="ml-8 mt-1 h-[3px] w-16 bg-amber-500" />
            </div>

            {actions && (
                <div className="flex items-center gap-4 pt-1">
                    {actions}
                </div>
            )}
        </div>
    );
}