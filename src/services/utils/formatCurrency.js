export const formatCurrency = (amount) => {
    amount = Number(amount)
   return typeof amount === "number" ? amount.toLocaleString("en-PK") : "";}
