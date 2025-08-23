"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

// MUI components
import {
  Box,
  Button,
  Typography,
  TextField,
  InputLabel,
  Container,
  Stack,
  Paper,
} from "@mui/material";

import TimePicker from "@/components/ui/time-picker"; // Nếu muốn có thể thay bằng MUI TimePicker

interface TransactionRow {
  STT?: number;
  Giờ: string;
  Ngày: string;
  "Mã khách hàng": string;
  "Mặt hàng": string;
  "Số lượng": number;
  "Thành tiền (VNĐ)": number;
  Trạm: string;
  "Trạng thái hoá đơn"?: string;
  "Trạng thái thanh toán"?: string;
  "Trụ bơm"?: string;
  "Đơn giá"?: number;
}

export default function Home() {
  const [data, setData] = useState<TransactionRow[]>([]);
  const [startTime, setStartTime] = useState("08:00:00");
  const [endTime, setEndTime] = useState("22:00:00");
  const [total, setTotal] = useState<number | null>(null);

  const toSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return 0;
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const s = parseInt(parts[2]) || 0;
    return h * 3600 + m * 60 + s;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json<TransactionRow>(worksheet, {
        range: 7,
      });
      const cleanedData: TransactionRow[] = jsonData.map((row) => {
        const rawValue = row["Thành tiền (VNĐ)"] as unknown;
        let value: number;

        if (typeof rawValue === "string") {
          value = Number(rawValue.replace(/[,.]/g, ""));
        } else if (typeof rawValue === "number") {
          value = rawValue;
        } else {
          value = 0;
        }

        return {
          ...row,
          "Thành tiền (VNĐ)": value,
        };
      });

      setData(cleanedData);
    };
    reader.readAsBinaryString(file);
  };

  const calculateTotal = () => {
    if (!data.length || !startTime || !endTime) {
      alert("Hãy upload file và nhập đủ thời gian!");
      return;
    }

    const startSec = toSeconds(startTime);
    const endSec = toSeconds(endTime);

    if (!startSec || !endSec) {
      alert("Thời gian không hợp lệ!");
      return;
    }

    const filtered = data.filter((row) => {
      const timeStr = row["Giờ"];
      const t = toSeconds(timeStr);
      return t >= startSec && t <= endSec;
    });

    const totalValue = filtered.reduce((sum, row) => {
      return sum + (row["Thành tiền (VNĐ)"] || 0);
    }, 0);

    setTotal(totalValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📊 Nhập giao dịch
        </Typography>

        <Stack spacing={3}>
          <Box className="rounded-2xl">
            <InputLabel shrink htmlFor="upload-excel">
              Upload file Excel
            </InputLabel>
            <TextField
              id="upload-excel"
              type="file"
              inputProps={{ accept: ".xlsx,.xls" }}
              onChange={handleFileUpload}
              fullWidth
            />
          </Box>

          <Stack direction="row" spacing={2}>
            <Box flex={1}>
              <InputLabel>Giờ bắt đầu</InputLabel>
              <TimePicker setTime={setStartTime} initialTime={startTime} />
            </Box>
            <Box flex={1}>
              <InputLabel>Giờ kết thúc</InputLabel>
              <TimePicker setTime={setEndTime} initialTime={endTime} />
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            onClick={calculateTotal}
            sx={{ alignSelf: "flex-start" }}
          >
            Tính tổng
          </Button>

          {total !== null && (
            <Typography variant="h6">
              Tổng thành tiền: {total.toLocaleString()} VND
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
