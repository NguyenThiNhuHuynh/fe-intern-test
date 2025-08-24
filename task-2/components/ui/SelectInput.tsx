"use client";
import { styled, alpha } from "@mui/material/styles";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectProps,
  FormHelperText,
} from "@mui/material";

interface Option {
  label: string;
  value: string | number;
}

interface SelectInputProps extends Omit<SelectProps, "onChange" | "value"> {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  error?: boolean;
  helperText?: string;
}

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: "#fff",
  border: "1px solid #E0E3E7",
  "& .MuiSelect-filled": {
    borderRadius: 8,
  },
  "&.Mui-focused": {
    backgroundColor: "#fff",
    boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
    borderColor: theme.palette.primary.main,
  },
  "&:hover": {
    borderColor: "#B2BAC2",
  },
  ...theme.applyStyles?.("dark", {
    backgroundColor: "#1A2027",
    borderColor: "#2D3843",
    color: "#fff",
  }),
}));

export default function SelectInput({
  label,
  value,
  options,
  onChange,
  error,
  helperText,
  ...rest
}: SelectInputProps) {
  return (
    <FormControl fullWidth variant="filled" error={error}>
      <InputLabel shrink>{label}</InputLabel>
      <StyledSelect
        value={value}
        disableUnderline
        displayEmpty
        onChange={(e) => onChange(e.target.value as string | number)}
        {...rest}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </StyledSelect>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
