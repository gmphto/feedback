import {
    InputAdornment,
    TextField,
    type TextFieldProps,
} from '@mui/material';
import type { ReactNode } from 'react';

type FieldProps = Omit<TextFieldProps, 'variant'> & {
    endAdornment?: ReactNode;
};

export function Field({
    endAdornment,
    slotProps,
    sx,
    ...props
}: FieldProps) {
    return (
        <TextField
            fullWidth
            variant="standard"
            slotProps={{
                inputLabel: {
                    shrink: true,
                    ...slotProps?.inputLabel,
                },
                input: {
                    ...slotProps?.input,
                    // endAdornment: endAdornment ? (
                    //     <InputAdornment position="end">
                    //         {endAdornment}
                    //     </InputAdornment>
                    // ) : slotProps?.input,
                },
            }}
            sx={{
                '& .MuiInputLabel-root': {
                    color: '#334155',
                    fontSize: 13,
                    fontWeight: 600,
                },

                '& .MuiInputLabel-asterisk': {
                    color: '#dc2626',
                },

                '& .MuiInputBase-root': {
                    color: '#64748b',
                    fontSize: 14,
                },

                '& .MuiInput-underline:before': {
                    borderBottomColor: '#aeb8c3',
                },

                '& input::placeholder': {
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    opacity: 1,
                },

                ...sx,
            }}
            {...props}
        />
    );
}