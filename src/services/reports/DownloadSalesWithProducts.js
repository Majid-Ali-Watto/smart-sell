import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

export const exportSalesWithProductsToExcel = async (salesData) => {
 
  const salesRows = [];
  const productRows = [];

  for (const sale of salesData) {
    const {
      id,
      customer,
      fullName,
      caste,
      mobile,
      address,
      date,
      total,
      paid,
      pending,
      products = [],
    } = sale;

    // Add sale row
    salesRows.push({
      "Sale ID": id ?? "",
      "Customer ID": customer ?? "",
      "Customer Name": fullName ?? "",
      Caste: caste ?? "",
      Mobile: mobile ?? "",
      Address: address ?? "",
      Date: new Date(date).toLocaleDateString("en-GB"),
      "Total (Rs.)": total || 0,
      "Paid (Rs.)": paid || 0,
      "Pending (Rs.)": pending || 0,
    });

    // Add product rows
    for (const product of products) {
      productRows.push({
        "Sale ID": id ?? "",
        Product: product?.product ?? "",
        Quantity: product?.quantity ?? "",
        "Price (Rs.)": product?.price || 0,
        "Product Total (Rs.)": product?.total || 0,
      });
    }
  }

  // --- Sales Sheet with Grand Total ---
  const salesSheet = XLSX.utils.json_to_sheet(salesRows);
  const salesRowCount = salesRows.length + 1;

  salesSheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  // Add Grand Total formulas
  XLSX.utils.sheet_add_aoa(
    salesSheet,
    [
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "Grand Total",
        { f: `SUM(H2:H${salesRowCount})` },
        { f: `SUM(I2:I${salesRowCount})` },
        { f: `SUM(J2:J${salesRowCount})` },
      ],
    ],
    { origin: `A${salesRowCount + 1}` }
  );

  // Footer
  XLSX.utils.sheet_add_aoa(
    salesSheet,
    [["Exported from SmartSell App © by Majid Ali Watto"]],
    { origin: -1 }
  );

  // --- Products Sheet with Per-Sale Subtotal in Last Row ---
  productRows.forEach((r) => {
    r["Sale Total (Rs.)"] = ""; // add column for totals
  });

  const saleIdGroups = {};
  productRows.forEach((row, index) => {
    const saleId = row["Sale ID"];
    if (!saleIdGroups[saleId]) {
      saleIdGroups[saleId] = [];
    }
    saleIdGroups[saleId].push(index + 2); // Excel rows are 1-based; +1 for header
  });

  const productsSheet = XLSX.utils.json_to_sheet(productRows);
  productsSheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  // Add subtotal formula to last row of each group
  for (const [saleId, rowNums] of Object.entries(saleIdGroups)) {
    const lastRow = rowNums[rowNums.length - 1];
    const formulaCell = `F${lastRow}`; // F = 6th column = "Sale Total (Rs.)"
    productsSheet[formulaCell] = {
      f: `SUMIF(A2:A${lastRow}, "${saleId}", E2:E${lastRow})`,
      t: "n",
    };
  }

  // Optional footer
  XLSX.utils.sheet_add_aoa(
    productsSheet,
    [["Exported from SmartSell App © by Majid Ali Watto"]],
    { origin: -1 }
  );

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");

  // Write file
  const wbout = XLSX.write(workbook, {
    type: "base64",
    bookType: "xlsx",
  });

  const today = new Date();
  const formattedDate = today
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-");
  const filename = `sales-report-${formattedDate}.xlsx`;
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
