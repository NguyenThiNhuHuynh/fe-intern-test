"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { Button, InputLabel, Container, Stack } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";

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
  const [file, setFile] = useState<File | null>(null);
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
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

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
    reader.readAsBinaryString(uploadedFile);
  };

  const removeFile = () => {
    setFile(null);
    setData([]);
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

    const totalValue = filtered.reduce(
      (sum, row) => sum + (row["Thành tiền (VNĐ)"] || 0),
      0
    );

    setTotal(totalValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <div className="p-6 shadow-2xl rounded-2xl space-y-4">
        <h1 className="text-3xl font-bold">Tính tổng Thành tiền</h1>
        <Stack spacing={3}>
          <div className="rounded-2xl w-fit">
            <InputLabel shrink>Upload file Excel</InputLabel>
            <input
              id="upload-excel"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => document.getElementById("upload-excel")?.click()}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                background: "#106df7",
                paddingLeft: 3,
                paddingRight: 3,
                "&:hover": {
                  backgroundColor: "#0b5ed7",
                  transform: "scale(1.05)",
                },
              }}
            >
              Select file
            </Button>

            {file && (
              <div className="border rounded-xl mt-2 pl-4 border-[#CCC]">
                <span className="text-[12px]">{file.name}</span>
                <Button onClick={removeFile}>
                  <CloseIcon />
                </Button>
              </div>
            )}
          </div>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={2}>
              <div className="flex-1">
                <InputLabel>Giờ bắt đầu</InputLabel>
                <TimePicker
                  value={startTime ? new Date(`1970-01-01T${startTime}`) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      const h = newValue.getHours().toString().padStart(2, "0");
                      const m = newValue
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                      const s = newValue
                        .getSeconds()
                        .toString()
                        .padStart(2, "0");
                      setStartTime(`${h}:${m}:${s}`);
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </div>

              <div className="flex-1">
                <InputLabel>Giờ kết thúc</InputLabel>
                <TimePicker
                  value={endTime ? new Date(`1970-01-01T${endTime}`) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      const h = newValue.getHours().toString().padStart(2, "0");
                      const m = newValue
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                      const s = newValue
                        .getSeconds()
                        .toString()
                        .padStart(2, "0");
                      setEndTime(`${h}:${m}:${s}`);
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </div>
            </Stack>
          </LocalizationProvider>

          <div className="w-fit">
            <Button
              variant="contained"
              color="primary"
              onClick={calculateTotal}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                background: "#106df7",
                paddingLeft: 3,
                paddingRight: 3,
                "&:hover": {
                  backgroundColor: "#0b5ed7",
                  transform: "scale(1.05)",
                },
              }}
            >
              Tính tổng
            </Button>
          </div>

          {total !== null && (
            <span className="text-xl font-semibold">
              Tổng thành tiền: {total.toLocaleString()} VND
            </span>
          )}
        </Stack>
      </div>
    </Container>
  );
}
