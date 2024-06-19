export const mockSortBillsByDate = (bills) => {
  return bills.sort((a, b) => new Date(b) - new Date(a));
};
