export function calculateAccountBalance(account, transactions) {
  const opening = Number(account.openingBalance) || 0;
  return (
    opening +
    transactions
      .filter(
        (t) => t.accountId === account.id && t.currency === account.currency,
      )
      .reduce(
        (sum, t) =>
          sum +
          (t.type === "income" ? 1 : t.type === "expense" ? -1 : 0) *
            Number(t.amount || 0),
        0,
      )
  );
}
