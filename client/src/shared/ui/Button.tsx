import { Button, type ButtonProps } from '@mui/material';

type AppButtonVariant =
    | 'footer-cancel'
    | 'footer-publish'
    | 'footer-save';

type AppButtonProps = ButtonProps & {
    appVariant: AppButtonVariant;
};

const variantStyles: Record<AppButtonVariant, object> = {
    'footer-cancel': {
        backgroundColor: '#e8791f',
    },
    'footer-publish': {
        backgroundColor: '#4f939b',
    },
    'footer-save': {
        backgroundColor: '#659c36',
    },
};

export function AppButton({
    appVariant,
    sx,
    ...props
}: AppButtonProps) {
    return (
        <Button
            variant="contained"
            disableElevation
            sx={{
                height: 40,
                minWidth: 112,
                borderRadius: '4px',
                px: 2,
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                ...variantStyles[appVariant],
                '&:hover': variantStyles[appVariant],
                ...sx,
            }}
            {...props}
        />
    );
}