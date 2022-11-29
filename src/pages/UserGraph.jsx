// @flow
import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { Layout } from 'antd';

import Graph from '../components/Graph';
import Sidebar from '../components/Sidebar';
import { getUserTransactions } from '../util/api';
import type { Transaction, StringDict, GraphLink, GraphNode } from '../types';
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
   * Generate graph nodes.
   * @param {Array<StringDict>} users a dictionary of users, where the key is the
   *                            username and the value is the display name.
   * @param {Array<{string: number}}} degrees a dictionary of user degrees, where
   *                                  the key is the username and the value is the degree.
   * @returns
   */
  const generateGraphNodes = (
    users: Array<StringDict>,
    degrees,
  ): Array<GraphNode> => {
    return Object.keys(users).map((user) => ({
      name: users[user],
      username: user,
      degree: degrees[user],
    }));
  };

  /**
   * Generate graph links.
   *
   * There is a current bug in the graph library – when the graph is updated, links that previously exist do not
   * change position to account for the new graph, and thus are detached. To get around the issue of the graph not
   * updating when links previously exist, we generate 'new links' by changing link id forcing a re-render.
   * Reference: https://github.com/vasturiano/react-force-graph/issues/238
   * @param {Array<GraphLink>} links the links to generate new links for
   * @returns {Array<GraphLink>} the generated links for the graph
   */
  const generateGraphLinks = (links: Array<GraphLink>): Array<GraphLink> => {
    const newLinks = [];
    links.forEach((link) => {
      newLinks.push({
        ...link,
        id: linkId,
      });
      setLinkId(linkId + 1);
    });
    return newLinks;
  };

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
   *                         the user degrees.
   * @param {number} degree - the degree to search to for the username.
   */
  const generateUserGraph = async (
    username: string,
    grow: boolean = false,
    degree: number = 2,
  ) => {
    const foundUsers = {};
    let searchedUsers = new Set();
    let usersToSearch = new Set();
    const foundUserDegrees: { [username: string]: number } = grow
      ? userDegrees
      : { [username]: 0 };

    const seenLinks = new Set();
    const foundLinks = [];
    const seenTransactions = new Set();
    const foundTransactions = [];

    const baseDegree = foundUserDegrees[username];
    for (let i = baseDegree; i < baseDegree + degree; i += 1) {
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
        const [degreeUsers, degreeLinks, degreeTransactions] = data;

        // Process all users found in the degree – add to found users and update user degrees.
        for (const u of Object.keys(degreeUsers)) {
          if (!(u in foundUsers)) foundUsers[u] = degreeUsers[u];
          if (!(u in foundUserDegrees)) foundUserDegrees[u] = i + 1;
        }

        // Display a single transaction between two users in the graph, and take
        // the latest. Links that are generated in future searches will be older.
        const newDegreeLinks = degreeLinks.filter((link) => {
          const people = [link.from, link.to].sort();
          const linkKey = `${people[0]}-${people[1]}`;
          if (seenLinks.has(linkKey)) return false;
          seenLinks.add(linkKey);
          return true;
        });
        foundLinks.push(...newDegreeLinks);

        // Keep only new transactions
        const newDegreeTransactions = degreeTransactions.filter((t) => {
          const transactionKey = `${t.actor.username}${t.date}`;
          if (seenTransactions.has(transactionKey)) return false;
          seenTransactions.add(transactionKey);
          return true;
        });
        foundTransactions.push(...newDegreeTransactions);

        if (!grow) {
          setUserGraph({
            nodes: generateGraphNodes(foundUsers, foundUserDegrees),
            links: generateGraphLinks(newDegreeLinks),
          });
        }
      });

      searchedUsers = new Set([...searchedUsers, ...usersToSearch]);
      setUserDegrees(foundUserDegrees);
      setTransactions([...transactions, ...foundTransactions]);
    }

    if (foundUsers.length === 0 && !grow) {
      // Typically only occurs when there is an API error
      setUserGraph({ nodes: [{ name: username, username }], links: [] });
    } else {
      for (const n of userGraph.nodes) foundUsers[n.username] = n.name;
      const newGraphLinks = grow
        ? [...userGraph.links, ...foundLinks]
        : foundLinks;

      setUserGraph({
        nodes: generateGraphNodes(foundUsers, foundUserDegrees),
        links: generateGraphLinks(newGraphLinks),
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
