export function calculateAccountBalance(account, transactions) {
  const openingBalance = Number(account.openingBalance) || 0;

  const linkedTransactions = transactions.filter(
    (transaction) => transaction.accountId === account.id,
  );

  const changes = linkedTransactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);

    if (!Number.isFinite(amount)) return total;

    if (transaction.type === "income") {
      return total + amount;
    }

    if (transaction.type === "expense") {
      return total - amount;
    }

    return total;
  }, 0);

  return openingBalance + changes;
}
