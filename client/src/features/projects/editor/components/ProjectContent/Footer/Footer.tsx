import { Stack } from "@mui/material";
import { DeleteButton } from "./DeleteButton";
import { CloseOrCancelButton } from "./CloseAndCancelButton";
import { CommitButton } from "./CommitButton";

export function Footer() {
  return (
    <Stack
      component="footer"
      direction="row"
      sx={{ alignItems: "center", gap: 2, flexWrap: "wrap" }}
    >
      <Stack direction="row" sx={{ gap: 1 }}>
        <DeleteButton />
      </Stack>

      <Stack direction="row" sx={{ gap: 1, ml: "auto" }}>
        <CloseOrCancelButton />
        <CommitButton />
      </Stack>
    </Stack>
  );
}