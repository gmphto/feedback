export type OkResult = true

export type OkCancelResult = boolean

export type DeleteCancelResult = boolean

export type YesNoResult = "yes" | "no"

export type ConfirmationResult<T> = (result: T) => void

export type StringLike = string | { toString(): string }

import { useId, type ReactNode } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";

type MessageBoxProps = {
    open: boolean;
    title: ReactNode;
    children: ReactNode;
    footer: ReactNode;
    onClose: () => void;
    onEntered?: () => void;
};

export function MessageBox({
    open,
    title,
    children,
    footer,
    onClose,
    onEntered,
}: MessageBoxProps) {
    const titleId = useId();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby={titleId}
            fullWidth
            maxWidth="xs"
            slotProps={{
                transition: {
                    onEntered,
                },
            }}
        >
            <DialogTitle id={titleId}>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>{footer}</DialogActions>
        </Dialog>
    );
}

type ConfirmationProps<T> = {
    open: boolean;
    title: ReactNode;
    children: ReactNode;
    onResult: ConfirmationResult<T>
}

export function OkCancelConfirm({ onResult, ...props }: ConfirmationProps<OkCancelResult>) {
    const cancel = () => onResult(false);

    return (
        <MessageBox
            {...props}
            onClose={cancel}
            footer={
                <>
                    <Button autoFocus onClick={cancel}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => onResult(true)}>
                        OK
                    </Button>
                </>
            }
        />
    );
}

export function DeleteCancelConfirm({ onResult, ...props }: ConfirmationProps<DeleteCancelResult>) {
    const cancel = () => onResult(false);

    return (
        <MessageBox
            {...props}
            onClose={cancel}
            footer={
                <>
                    <Button autoFocus onClick={cancel}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => onResult(true)}>
                        Delete
                    </Button>
                </>
            }
        />
    );
}

export function YesNoConfirm({ onResult, ...props }: ConfirmationProps<YesNoResult>) {
    const no = () => onResult("no");

    return (
        <MessageBox
            {...props}
            onClose={no}
            footer={
                <>
                    <Button autoFocus onClick={no}>
                        No
                    </Button>
                    <Button variant="contained" onClick={() => onResult("yes")}>
                        Yes
                    </Button>
                </>
            }
        />
    );
}

// showOkCancel(ContentVisibilityAutoStateChangeEvent,)

// function CancelButton() {

//     const [open, setOpen] = useState(false);

//     // actions
//     function cancel(ok: OkCancelResult) {
//         setOpen(false);

//         if (ok) {
//             //   saveChanges();
//         }
//     }

//     return (
//         <>
//             <Button onClick={() => setOpen(true)}>Save</Button>

//             <OkCancelConfirm
//                 open={open}
//                 title="Save changes?"
//                 onResult={cancel}
//             >
//                 All changes to this project will be cancelled, and it will be removed from the editor
//             </OkCancelConfirm>
//         </>
//     );
// }
