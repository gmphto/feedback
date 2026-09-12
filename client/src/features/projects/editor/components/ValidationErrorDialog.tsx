import type { ProjectDraft } from '../types/projectDraft';
import { getValidationMessage } from '../validationMessages';
import { MessageBox } from '../../../../shared/ui/MessageBox';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface ProjectValidationErrorProps {
    draft: ProjectDraft, onClose: () => void
}


export function ProjectValidationError({ draft, onClose }:ProjectValidationErrorProps) {

    const messages = getValidationMessage(draft);

    const title = "Invalid project"

    return (

        <ValidationError title={title} msgs={messages} onClose={onClose} />

    )
}


interface Props {
    title: string
    msgs: string[],
    onClose: () => void
}

export function ValidationError({ title, msgs , onClose }: Props) {

    const content = (
        <Stack direction="column" spacing={1}>
            <p>Changes cannot be saved becauase of the following issues:</p>
        </Stack>
    )

    // const title = <p>Invalid project</p>

    const invalidItems = (
        <ul>
            {msgs.map((msg, idx) => (
                <li key={idx}>
                    {msg}
                </li>
            ))}
        </ul>
    )

    const dialog = <MessageBox
        title={title}
        open
        onClose={onClose}
        footer={
            <>
                <Button variant="contained" onClick={() => onClose()}>
                    OK
                </Button>
            </>
        }
    > {content} {invalidItems} </MessageBox>

    return dialog;
}

/**
 * 
 * writing an fc component in a clean way
 * 
 * focus on presentational first, extract business logic out
 * 
 * the above extracts business logic e.g. if validation messages are there or not
 * 
 * const element = <> </>
 * 
 * return {
 *      element
 * }
 */


// function ValidationError(draft: ProjectDraft) {

//     const messages = getValidationMessage(draft);

//     const content = (
//         <Stack direction="column" spacing={1}>
//             <p>Changes cannot be saved becauase of the following issues:</p>
//         </Stack>
//     )

//     const title = <p>Invalid project</p>

//     const invalidItems = (
//         <ul>
//             {messages.map((msg, idx) => (
//                 <li key={idx}>
//                     {msg}
//                 </li>
//             ))}
//         </ul>
//     )

//     return (content, title, invalidItems)
// }



