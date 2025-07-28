import { formatCurrency } from "../utils/formatCurrency";


export const generateUserSummaryMessage = ({ fullName, total, given, pending }) => {
  return `
📢 *Payment Summary*

👤 Name: *${fullName?.trim()}*
💰 Total Amount: *Rs. ${formatCurrency(total.toFixed(2))}*
✅ Paid: *Rs. ${formatCurrency(given.toFixed(2))}*
⏳ Pending: *Rs. ${formatCurrency(pending.toFixed(2))}*

Thank you for your business!
- Majid Ali
`;
};
