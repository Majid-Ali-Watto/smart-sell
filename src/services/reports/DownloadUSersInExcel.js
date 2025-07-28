import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

export const exportToExcel = async (users) => {
  const headers = [
    { label: "Full Name", key: "fullName" },
    { label: "Caste", key: "caste" },
    { label: "Mobile", key: "mobile" },
    { label: "Address", key: "address" },
    { label: "Total (Rs.)", key: "total" },
    { label: "Given (Rs.)", key: "given" },
    { label: "Pending (Rs.)", key: "pending" },
  ];

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "";
    return `${amount.toLocaleString("en-PK")}`;
  };

  const dataRows = users.map((user) => {
    const row = {};
    headers.forEach((h) => {
      const value = user[h.key];
      row[h.label] = ["total", "given", "pending"].includes(h.key)
        ? formatCurrency(value || 0)
        : value ?? "";
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 }; // Freeze first row

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [["Exported from SmartSell App © by Majid Ali Watto"]],
    { origin: -1 }
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  const wbout = XLSX.write(workbook, {
    type: "base64",
    bookType: "xlsx",
  });

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].split("-").reverse().join("-");
  const filename = `users-${formattedDate}.xlsx`;
  const uri = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(uri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri);
  } else {
    alert("Sharing not available on this device");
  }
};
