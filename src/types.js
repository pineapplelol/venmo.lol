// @flow

export type StringDict = { [string]: string };

export type GraphNode = {
  name: string,
  username: string,
  neighbors?: Array<string>,
  links?: Array<string>,
  degree?: number,
};

export type GraphLink = {
  to: string,
  from: string,
  name: string,
  id?: string,
};

export type GraphData = {
  nodes: Array<GraphNode>,
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
