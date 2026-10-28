export function formatMoney(amount, currency = "USD") {
  if (!["USD", "LKR"].includes(currency))
    return `${Number(amount).toFixed(2)} (currency unknown)`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount) || 0,
  );
}
export function currencyOf(record) {
  return ["USD", "LKR"].includes(record?.currency) ? record.currency : null;
}
export function sumAmounts(records) {
  return records.reduce((total, item) => total + Number(item.amount || 0), 0);
}
