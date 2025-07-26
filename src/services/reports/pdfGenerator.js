export async function generatePDF(search, filteredSales, summary) {
  const currentDate = new Date().toLocaleDateString();
  const searchInfo = search ? `Filtered by: "${search}"` : "All Sales";

  const salesRows = filteredSales
    .map((sale, index) => {
      // Format products list
      const productsInfo =
        sale.products && sale.products.length > 0
          ? sale.products
              .map(
                (product) => `<div style="margin-bottom: 3px; font-size: 11px;">
              <strong>${product.product || "N/A"}</strong><br>
              Qty: ${product.quantity || 0} * Rate: Rs. ${(
                  product.price || 0
                ).toLocaleString()} <br/> Total: Rs. ${(
                  (product.quantity || 0) * (product.price || 0)
                ).toLocaleString()}
                    <hr style="border: 0; border-top: 1px solid #ddd; margin: 5px 0;">
            </div>`
              )
              .join("")
          : '<div style="font-size: 11px; color: #666;">No products</div>';

      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; border-right: 1px solid #ddd;">${
            index + 1
          }</td>
          <td style="padding: 8px; border-right: 1px solid #ddd;">${
            sale.customer || "N/A"
          }</td>
          <td style="padding: 8px; border-right: 1px solid #ddd;">${
            sale.id || "N/A"
          }</td>
          <td style="padding: 8px; border-right: 1px solid #ddd;"><span style="font-weight: bold;">. ${
            sale.fullName
          }</span><br/>. ${sale.caste}<br/>. ${sale.mobile || "N/A"}</td>
          <td style="padding: 8px; border-right: 1px solid #ddd;">${
            sale.address || "N/A"
          }</td>
          <td style="padding: 8px; border-right: 1px solid #ddd; font-size: 10px;">${productsInfo}
          <br/>
          <span style="font-weight: bold; color: #087E8B;">
          Grand Total: Rs. ${(sale.total || 0).toLocaleString()}</span>
          <br/><span style="color: #28A745;">
          Paid: Rs. ${(sale.paid || 0).toLocaleString()}
        </span>
        <span style="color: #DC3545;">
        <br/>Pending: Rs. ${(sale.pending || 0).toLocaleString()} 
        </span>
          </td>
         
        </tr>
      `;
    })
    .join("");
  const summaryContent = summary?`
        <div class="summary">
          <div class="summary-title">Summary</div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${summary?.count}</div>
              <div class="summary-label">${
                search ? "Filtered Sales" : "Total Sales"
              }</div>
            </div>
            <div class="summary-item">
              <div class="summary-value total-value">Rs. ${summary?.totalSales?.toLocaleString()}</div>
              <div class="summary-label">Total Amount</div>
            </div>
            <div class="summary-item">
              <div class="summary-value paid-value">Rs. ${summary?.totalPaid?.toLocaleString()}</div>
              <div class="summary-label">Amount Received</div>
            </div>
            <div class="summary-item">
              <div class="summary-value pending-value">Rs. ${summary?.totalPending?.toLocaleString()}</div>
              <div class="summary-label">Amount Pending</div>
            </div>
          </div>
        </div>`:'';
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sales Report</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #087E8B;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #087E8B;
            margin-bottom: 5px;
          }
          .report-title {
            font-size: 18px;
            color: #666;
            margin-bottom: 10px;
          }
          .report-info {
            font-size: 12px;
            color: #888;
          }
          .summary {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
          }
          .summary-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }
          .summary-item {
            text-align: center;
            padding: 10px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          .summary-value {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
          }
          .total-value { color: #087E8B; }
          .paid-value { color: #28A745; }
          .pending-value { color: #DC3545; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th {
            background-color: #087E8B;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Watto Spray Sales</div>
          <div class="report-title">Sales Report</div>
          <div class="report-info">
            Generated on: ${currentDate} | ${searchInfo}
          </div>
        </div>

        ${summaryContent}

        ${
          filteredSales.length > 0
            ? `
          <table>
            <thead>
              <tr>
                <th style="width: 4%;">#</th>
                <th style="width: 15%;">Customer ID</th>
                <th style="width: 15%;">Order ID</th>
                <th style="width: 15%;">Customer</th>
                <th style="width: 18%;">Address</th>
                <th style="width: 33%;">Products Details</th>
              </tr>
            </thead>
            <tbody>
              ${salesRows}
            </tbody>
          </table>
        `
            : `
          <div class="no-data">
            No sales data found for the current search criteria.
          </div>
        `
        }

        <div class="footer">
          This report was generated automatically on ${currentDate}
        </div>
      </body>
      </html>
    `;
}
