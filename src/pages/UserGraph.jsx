// @flow
import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { Layout } from 'antd';

import Graph from '../components/Graph';
import Sidebar from '../components/Sidebar';
import { getUserTransactions } from '../util/api';
import type { Transaction, StringDict, GraphLink } from '../types';
import '../css/UserGraph.css';

const { Content } = Layout;

type Props = {
  pageUser: string,
};

function UserGraph(props: Props): Node {
  const { pageUser } = props;
  const displayUsername = pageUser;

  const [userGraph, setUserGraph] = useState({ nodes: [], links: [] });
  const [userDegrees, setUserDegrees] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [linkId, setLinkId] = useState(0);

  /**
   * Will search a single degree of all the users in usersToSearch. Will return all
   * new users, links, and transactions.
   * @param {Set<String>} usersToSearch - set of all users to search a single degree of.
   * @return A list of users, links, and transactions.
   */
  const searchDegree = async (
    usersToSearch: Set<string>,
    maxTransactions: number = 20,
  ): Promise<[StringDict, Array<GraphLink>, Array<Transaction>]> => {
    // Users is a dictionary of all users found during the search. The key is the username,
    // and the value is the user's display name.
    const users = {};
    const links = [];
    const degreeTransactions = [];

    const searches = [];
    for (const user of usersToSearch) searches.push(getUserTransactions(user));

    return Promise.all(searches)
      .then((userTransactionData) => {
        const cleanUserTransactionData = userTransactionData.filter(
          (d) => d && Array.isArray(d),
        );
        for (let userTransactions of cleanUserTransactionData) {
          userTransactions = userTransactions.slice(0, maxTransactions);
          for (const t of userTransactions) {
            users[t.actor.username] = t.actor.name;
            users[t.target.username] = t.target.name;
            links.push({
              from: t.actor.name,
              to: t.target.name,
              name: `${t.actor.name} ${t.action} ${t.target.name}: ${t.note} at ${t.date}`,
            });
            degreeTransactions.push(t);
          }
        }
      })
      .then(() => [users, links, degreeTransactions]);
  };

  /**
   * Will generate a user graph to be displayed given a username. Searches to default degree
   * of 2 for a given user.
   * @param {string} username - the user to for which the graph will be generated.
   * @param {boolean} grow - if there is an existing graph to add to. Will not change
   *                       the user degrees.
   * @param {number} degree - the degree to search to for the username.
   */
  const generateUserGraph = async (
    username: string,
    grow: boolean = false,
    degree: number = 2,
  ) => {
    // foundUsers is a dictionary of all users found during the graph creation. The key is the username,
    // and the value is the user's display name.
    const foundUsers = {};
    let searchedUsers = new Set();
    let usersToSearch = new Set();
    const curUserDegrees: { [username: string]: number } = grow
      ? userDegrees
      : { [username]: 0 };

    const seenLinks = new Set();
    const graphLinks = [];
    const seenTransactions = new Set();
    const curTransactions = [];

    const baseDegree = curUserDegrees[username];
    for (let i = baseDegree; i < baseDegree + degree; i += 1) {
      // Generate set of users to search
      usersToSearch =
        i !== baseDegree
          ? new Set(
              Object.keys(foundUsers).filter(
                (x) => !searchedUsers.has(x) && x !== 'null',
              ),
            )
          : new Set([username]);

      // eslint-disable-next-line no-await-in-loop
      await searchDegree(usersToSearch).then((data) => {
        const [users, links, degreeTransactions] = data;

        // Add all new users from the search to foundUsers.
        for (const u of Object.keys(users)) {
          if (!(u in foundUsers)) foundUsers[u] = users[u];
        }
        // Add degrees of new users to curUserDegrees
        for (const u of Object.keys(foundUsers)) {
          if (!(u in curUserDegrees)) curUserDegrees[u] = i + 1;
        }
        setUserDegrees(curUserDegrees);

        // Generate graph nodes by using the display names of foundUsers.
        const graphNodes = Object.keys(foundUsers).map((user) => ({
          name: foundUsers[user],
          username: user,
          degree: curUserDegrees[user],
        }));

        // Display only one transaction between two people in the graph.
        for (const l of links) {
          const k = `${l.to}${l.from}`;
          if (!seenLinks.has(k)) {
            seenLinks.add(k);
            graphLinks.push(l);
          }
        }

        if (!grow) {
          setUserGraph({ nodes: graphNodes, links: [] });
          // https://github.com/vasturiano/react-force-graph/issues/238
          // setUserGraph({ nodes: graphUsers, links: graphLinks });
        }

        // Keep only new transactions
        for (const t of degreeTransactions) {
          const k = `${t.actor.username}${t.date}`;
          if (!seenTransactions.has(k)) {
            seenTransactions.add(k);
            curTransactions.push(t);
          }
        }
        setTransactions([...transactions, ...curTransactions]);
      });

      searchedUsers = new Set([...searchedUsers, ...usersToSearch]);
    }

    if (foundUsers.length === 0 && !grow) {
      // Typically only occurs when there is an API error
      setUserGraph({ nodes: [{ name: username, username }], links: [] });
    } else if (grow) {
      // Combine new found users and users already in the graph
      const allUsers = foundUsers;
      for (const x of userGraph.nodes) allUsers[x.username] = x.name;

      const newNodes = Object.keys(allUsers).map((user) => ({
        name: allUsers[user],
        username: user,
        degree: curUserDegrees[user],
        links: [],
      }));

      // To get around the issue of the graph not updating when links previously exist,
      // we generate 'new links' by changing link id forcing a re-render.
      // https://github.com/vasturiano/react-force-graph/issues/238
      const newLinks = [];
      for (const x of [...userGraph.links, ...graphLinks]) {
        newLinks.push({ id: linkId, ...x });
        setLinkId(linkId + 1);
      }

      setUserGraph({
        nodes: newNodes,
        links: newLinks,
      });
    } else {
      setUserGraph({
        nodes: Object.keys(foundUsers).map((user) => ({
          name: foundUsers[user],
          username: user,
          degree: curUserDegrees[user],
        })),
        links: graphLinks,
      });
    }
  };

  /**
   * Wrapper function to add a user search to graph.
   * @param {string} username - the user to search and add to graph.
   */
  const addNode = (username: string) => {
    generateUserGraph(username, true, 1);
  };

  /**
   * Function to convert dictionary of users to degrees into a sorted array of tuples
   * in the format [user, degree].
   * @param {object} degrees - dictionary of users to degrees.
   */
  const sortUserDegrees = (userDegreesToSort: {
    string: number,
  }): Array<[string, number]> => {
    const items: Array<[string, number]> = Object.keys(userDegreesToSort).map(
      (key) => [key, userDegreesToSort[key]],
    );
    items.sort((a, b) => a[1] - b[1]);
    return items;
  };

  useEffect(() => {
    generateUserGraph(pageUser);
  }, [pageUser]);

  return (
    <Layout>
      <Sidebar
        username={displayUsername}
        userDegrees={sortUserDegrees(userDegrees)}
        transactions={transactions}
      />
      <Content className="graph">
        <Graph graph={userGraph} addNode={addNode} />
      </Content>
    </Layout>
  );
}

export default UserGraph;
