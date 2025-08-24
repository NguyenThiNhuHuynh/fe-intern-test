import fetch from "node-fetch";

const INPUT_URL = "https://share.shub.edu.vn/api/intern-test/input";
const OUTPUT_URL = "https://share.shub.edu.vn/api/intern-test/output";

async function solve() {
  const res = await fetch(INPUT_URL);
  const json = await res.json();
  const { token, data, query } = json;

  console.log("Token:", token);
  console.log("Số lượng phần tử trong data:", data.length);
  console.log("Data:", data);
  console.log("Số lượng query:", query.length);
  console.log("Query:", query);

  const n = data.length;

  const prefixSum = new Array(n).fill(0);
  const alt = new Array(n).fill(0);

  prefixSum[0] = data[0];
  alt[0] = data[0];

  for (let i = 1; i < n; i++) {
    prefixSum[i] = prefixSum[i - 1] + data[i];
    alt[i] = alt[i - 1] + (i % 2 === 0 ? data[i] : -data[i]);
  }

  const results = [];

  for (let q of query) {
    const { type, range } = q;
    let [l, r] = range;

    if (type === "1") {
      let sum = prefixSum[r] - (l > 0 ? prefixSum[l - 1] : 0);
      results.push(sum);
    } else {
      let raw = alt[r] - (l > 0 ? alt[l - 1] : 0);
      if (l % 2 === 1) raw = -raw;
      results.push(raw);
    }
  }

  console.log("Kết quả:", results);
  console.log("token", token);

  await fetch(OUTPUT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(results),
  });

  console.log("Đã gửi.");
}

solve();
