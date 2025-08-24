"use client";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import * as Yup from "yup";
import { Dayjs } from "dayjs";
import SelectInput from "@/components/ui/SelectInput";
import TextInput from "@/components/ui/TextInput";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

const validationSchema = Yup.object({
  dateTime: Yup.date().required("Thời gian là bắt buộc"),
  quantity: Yup.number()
    .typeError("Số lượng phải là một số hợp lệ")
    .required("Số lượng là bắt buộc")
    .positive("Số lượng phải lớn hơn 0"),
  station: Yup.string().required("Trụ là bắt buộc"),
  revenue: Yup.number()
    .typeError("Doanh thu phải là một số hợp lệ")
    .positive("Doanh thu phải lớn hơn 0"),
  price: Yup.number()
    .typeError("Đơn giá phải là một số hợp lệ")
    .required("Đơn giá là bắt buộc")
    .positive("Đơn giá phải lớn hơn 0"),
});

interface ValidationErrors {
  dateTime?: string;
  quantity?: string;
  station?: string;
  revenue?: string;
  price?: string;
}

export default function TransactionForm() {
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [station, setStation] = useState<string>("");
  const [revenue, setRevenue] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: string | Dayjs | null) => {
    try {
      validationSchema.validateSyncAt(name, {
        ...{ dateTime, quantity, station, revenue, price },
        [name]: value,
      });
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear the error for the field
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: err.message }));
      }
    }
  };

  const handleInputChange = (field: string, value: string | Dayjs | null) => {
    validateField(field, value);
    switch (field) {
      case "dateTime":
        setDateTime(value as Date | null);
        break;
      case "quantity":
        setQuantity(value as string);
        break;
      case "station":
        setStation(value as string);
        break;
      case "revenue":
        setRevenue(value as string);
        break;
      case "price":
        setPrice(value as string);
        break;
    }
  };

  const validateForm = () => {
    const validationResult: ValidationErrors = {};
    try {
      validationSchema.validateSync(
        { dateTime, quantity, station, revenue, price },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationResult[error.path as keyof ValidationErrors] =
            error.message;
        });
      }
    }
    return validationResult;
  };

  const handleSubmit = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log({ dateTime, quantity, station, revenue, price });
      alert("Cập nhật giao dịch thành công!");
    } else {
      alert("Có lỗi trong quá trình nhập liệu, vui lòng kiểm tra lại.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          boxShadow: "0 6px 15px rgba(0, 0, 0, 0.05)",
          py: 3,
        }}
      >
        <Toolbar sx={{ display: "block", justifyContent: "space-between" }}>
          <div className="flex justify-between">
            <div>
              <IconButton edge="start" color="inherit">
                <ArrowBackIcon className="" />
              </IconButton>
              <span className="font-normal">Đóng</span>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                background: "#106df7",
                paddingLeft: 3,
                paddingRight: 3,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  background: "#0b5ed7",
                  transform: "scale(1.05)",
                },
              }}
            >
              Cập nhật
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Nhập giao dịch</h1>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <DateTimePicker
            label="Thời gian"
            value={dateTime} // Dayjs | null (đúng kiểu bạn đang dùng)
            onChange={(v) => handleInputChange("dateTime", v as Dayjs | null)}
            error={!!errors.dateTime}
            helperText={errors.dateTime}
            roundedClass="rounded-[8px]"
          />

          <TextInput
            label="Số lượng"
            type="number"
            value={quantity}
            onChange={(e) => handleInputChange("quantity", e.target.value)}
            error={!!errors.quantity}
            helperText={errors.quantity}
            roundedClass="rounded-lg"
          />

          <SelectInput
            label="Trụ"
            value={station}
            options={[
              { label: "Trụ 1", value: "Trụ 1" },
              { label: "Trụ 2", value: "Trụ 2" },
              { label: "Trụ 3", value: "Trụ 3" },
            ]}
            onChange={(val) => handleInputChange("station", val.toString())}
            fullWidth
            error={!!errors.station}
            helperText={errors.station}
          />

          <TextInput
            label="Doanh thu"
            type="number"
            fullWidth
            value={revenue}
            onChange={(e) => handleInputChange("revenue", e.target.value)}
            error={!!errors.revenue}
            helperText={errors.revenue}
          />

          <TextInput
            label="Đơn giá"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            error={!!errors.price}
            helperText={errors.price}
          />
        </Box>
      </Container>
    </LocalizationProvider>
  );
}
