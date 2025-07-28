export function calculateSummary(salesData) {
  const totalSales = salesData.reduce(
    (sum, sale) => sum + (sale.total || 0),
    0
  );
  const totalPaid = salesData.reduce(
    (sum, sale) => sum + (sale.paid ?? sale.given ?? 0),
    0
  );
  const totalPending = salesData.reduce(
    (sum, sale) => sum + (sale.pending || 0),
    0
  );

  return {
    count: salesData.length,
    totalSales,
    totalPaid,
    totalPending,
  };
}
