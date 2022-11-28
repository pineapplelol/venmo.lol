// @flow

export type StringDict = { [string]: string };

export type GraphLink = { to: string, from: string, name: string };

export type GraphData = {
  nodes: Array<{ name: string }>,
  links: Array<GraphLink>,
};

export type Transaction = {
  date: string,
  note: string,
  action: string,
  actor: {
    name: string,
    username: string,
  },
  target: {
    name: string,
    username: string,
  },
};
