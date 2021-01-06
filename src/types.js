// @flow

export type GraphData = {
  nodes: Array<{ name: string }>,
  links: Array<{ to: string, from: string, name: string }>,
};

export type Transaction = {
  sender: string,
  recipient: string,
  message: string,
  transactionType: string,
  date: string,
};
