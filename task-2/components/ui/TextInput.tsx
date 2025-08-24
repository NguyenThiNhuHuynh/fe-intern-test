import { styled, alpha } from "@mui/material/styles";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";

const TextInput = styled((props: TextFieldProps) => (
  <TextField
    variant="filled"
    slotProps={{
      input: { disableUnderline: true } as Partial<OutlinedInputProps>,
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiFilledInput-root": {
    overflow: "hidden",
    borderRadius: 8,
    border: "1px solid",
    backgroundColor: "#fff",
    borderColor: "#E0E3E7",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    "&:hover": {
      backgroundColor: "#fff",
      borderColor: "#B2BAC2",
    },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
  },

  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
    {
      WebkitAppearance: "none",
      margin: 0,
    },
  "& input[type=number]": {
    MozAppearance: "textfield",
  },

  ...theme.applyStyles?.("dark", {
    "& .MuiFilledInput-root": {
      backgroundColor: "#1A2027",
      borderColor: "#2D3843",
      color: "#fff",
    },
  }),
}));

export default TextInput;
