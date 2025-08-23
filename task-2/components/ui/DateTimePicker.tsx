"use client";
import * as React from "react";
import { Dayjs } from "dayjs";
import { FormControl, FormHelperText } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface CustomDateTimePickerProps {
  label: string;
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  error?: boolean;
  helperText?: string;
}

export default function CustomDateTimePicker({
  label,
  value,
  onChange,
  error = false,
  helperText = "",
}: CustomDateTimePickerProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <FormControl fullWidth error={error}>
      {" "}
      {/* Pass error prop here */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          value={value}
          onChange={(newValue) => onChange(newValue as Dayjs | null)}
          format="DD/MM/YYYY HH:mm:ss"
          slotProps={{
            textField: {
              label,
              fullWidth: true,
              size: "small",
              variant: "filled",
              sx: {
                "& .MuiFilledInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #E0E3E7",
                  transition:
                    "border-color 0.3s, background-color 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    backgroundColor: "#fff",
                    borderColor: "#B2BAC2",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#fff",
                    boxShadow: "rgba(25, 118, 210, 0.25) 0 0 0 2px",
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputBase-root": {
                  backgroundColor: "#fff",
                },
              },
            },
          }}
        />
      </LocalizationProvider>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}{" "}
    </FormControl>
  );
}
