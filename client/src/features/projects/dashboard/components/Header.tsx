import { Add } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { FormEvent } from "react";

import type { ProjectGroupingType, ProjectSortOrderType } from "../types";

interface HeaderProps {
  pageTitle: string;
  onCreate: () => void;
  grouping?: ProjectGroupingType;
  sortOrder: ProjectSortOrderType;
  filter?: string;
  onGroupingChange: (grouping: ProjectGroupingType | undefined) => void;
  onSortOrderChange: (sortOrder: ProjectSortOrderType) => void;
  onFilterChange: (filter: string | undefined) => void;
}

/** Toolbar select items, kept minimal and text-only per the dense enterprise grammar. */
const groupingOptions: Array<{ value: ProjectGroupingType | ""; label: string }> = [
  { value: "", label: "No grouping" },
  { value: "name", label: "Name" },
  { value: "date", label: "Date" },
];

const sortOrderOptions: Array<{ value: ProjectSortOrderType; label: string }> = [
  { value: "nameAsc", label: "Name (ascending)" },
  { value: "nameDesc", label: "Name (descending)" },
  { value: "dateAsc", label: "Date (ascending)" },
  { value: "dateDesc", label: "Date (descending)" },
];

/**
 * The shallow page header for the dashboard:
 *
 *   Plans  [+]                  Group  Sort  Search
 *
 * The primary create action is a small circular green plus beside the title;
 * secondary controls sit to the right in one compact row.
 */
export function Header({
  pageTitle,
  onCreate,
  grouping,
  sortOrder,
  filter,
  onGroupingChange,
  onSortOrderChange,
  onFilterChange,
}: HeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: "text.primary",
          lineHeight: 1.2,
        }}
      >
        {pageTitle}
      </Typography>

      <IconButton
        size="small"
        aria-label="Create plan"
        title="Create plan"
        onClick={onCreate}
        sx={{
          width: 24,
          height: 24,
          p: 0,
          backgroundColor: "success.main",
          color: "#fff",
          "&:hover": { backgroundColor: "success.main" },
          "& .MuiSvgIcon-root": { fontSize: 16 },
        }}
      >
        <Add />
      </IconButton>

      <Stack
        direction="row"
        sx={{
          ml: "auto",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <GroupSelect
          label="Group"
          value={grouping ?? ""}
          options={groupingOptions}
          onChange={(value) =>
            onGroupingChange(value === "" ? undefined : value)
          }
        />

        <GroupSelect
          label="Sort"
          value={sortOrder}
          options={sortOrderOptions}
          onChange={onSortOrderChange}
        />

        <TextField
          variant="standard"
          size="small"
          placeholder="Search"
          value={filter ?? ""}
          onChange={(event) => onFilterChange(event.target.value || undefined)}
          sx={{
            minWidth: 140,
            "& .MuiInputBase-root": { fontSize: 11 },
          }}
        />
      </Stack>
    </Box>
  );
}

interface GroupSelectProps<T extends string> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  onSubmit?: () => void;
}

/** A compact labelled text select rendered as a native select to stay small and inline. */

function GroupSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  onSubmit,
}: GroupSelectProps<T>) {
  const handleChange = (event: FormEvent<HTMLSelectElement>) => {
    onChange(event.currentTarget.value as T);
  };

  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 0.5 }}
    >
      <Typography
        component="label"
        sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap" }}
      >
        {label}
      </Typography>
      <select
        value={value}
        onChange={handleChange}
        onBlur={onSubmit}
        style={{
          fontSize: 11,
          padding: "2px 4px",
          border: "1px solid #d0d5dd",
          borderRadius: 4,
          backgroundColor: "#fff",
          color: "#14181f",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Stack>
  );
}