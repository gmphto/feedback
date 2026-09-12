import { Paper, type PaperProps } from '@mui/material';
import type { ReactNode } from 'react';

type CardProps = PaperProps & {
    children: ReactNode;
};

export function Card({
    children,
    sx,
    ...props
}: CardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 8px rgb(15 23 42 / 0.05)',
                ...sx,
            }}
            {...props}
        >
            {children}
        </Paper>
    );
}