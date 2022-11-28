// @flow
import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { Layout } from 'antd';

import Graph from '../components/Graph';
import Sidebar from '../components/Sidebar';
import { getUserTransactions } from '../util/api';
import '../css/UserGraph.css';

import type { Transaction, StringDict, GraphLink } from '../types';

const { Content } = Layout;

type Props = {
  pageUser: string,
};

function UserGraph(props: Props): Node {
  const { pageUser } = props;

  const [displayUsername, setDisplayUsername] = useState(pageUser);
  const [userGraph, setUserGraph] = useState({ nodes: [], links: [] });
  const [userDegrees, setUserDegrees] = useState({});
  const [transactions, setTransactions] = useState([]);

  /**
   * This will match the pageUser to the correct username. Specifically, if
   * someone searches 'User' and their venmo username is 'user', then it will find
   * 'user' in the set of returned usernames and correct it.
   * @param {Set<string>} allUsers - a list of all users found during the search.
   */
  const matchUsername = (allUsers) => {
    if (allUsers.size === 0) return pageUser;
    for (const u of allUsers) {
      if (u.toLowerCase() === pageUser.toLowerCase()) return u;
    }
    return pageUser;
  };

  /**
   * Will search a single degree of all the users in toSearch. Will return all
   * new users, links, and transactions.
   * @param {Set<String>} toSearch - set of all users to search a single degree of.
   * @return A list of users, links, and transactions.
   */
  const searchDegree = async (
    toSearch: Set<string>,
    maxTransactions: number = 10,
  ): Promise<[StringDict, Array<GraphLink>, Array<Transaction>]> => {
    // Users is a dictionary of all users found during the search. The key is the username,
    // and the value is the user's display name.
    const users = {};
    const links = [];
    const transactions = [];

    const searches = [];
    for (const user of toSearch) searches.push(getUserTransactions(user));

    return Promise.all(searches)
      .then((userTransactionData) => {
        userTransactionData = userTransactionData.filter((d) => d !== null);
        for (let userTransactions of userTransactionData) {
          if (!userTransactions || !Array.isArray(userTransactions)) continue;
          userTransactions = userTransactions.slice(0, maxTransactions);
          for (const t of userTransactions) {
            users[t.actor.username] = t.actor.name;
            users[t.target.username] = t.target.name;
            links.push({
              from: t.actor.name,
              to: t.target.name,
              name: `${t.actor.name} ${t.action} ${t.target.name}: ${t.note}`,
            });
            transactions.push(t);
          }
        }
      })
      .then(() => {
        return [users, links, transactions];
      });
  };

  /**
   * Will generate a user graph to be displayed given a username. Searches to degree of 3
   * for a given user.
   * @param {string} username - the user to for which the graph will be generated.
   * @param {boolean} grow - if there is an existing graph to add to. Will not change
   *                       the user degrees.
   * @param {number} degree - the degree to search to for the username.
   */
  const generateUserGraph = async (
    username: string,
    grow: boolean = false,
    degree: number = 3,
  ) => {
    // const generateUserGraph = async (username, grow = false, degree = 1) => {
    // allUsers is a dictionary of all users found the graph creation. The key is the username,
    // and the value is the user's display name.
    const allUsers = {};
    // searched is a set of all usernames that have been searched.
    let searched = new Set();
    // toSearch is a set of all usernames that need to be searched.
    let toSearch = new Set([username]);
    let realUsername = '';
    const curUserDegrees: { [username: string]: number } = grow
      ? userDegrees
      : { [username]: 0 };

    const seenLinks = new Set();
    const graphLinks = [];

    const seenTransactions = new Set();
    const curTransactions = [];

    const baseDegree = curUserDegrees[username] || 0;
    for (let i = baseDegree; i < degree; i += 1) {
      if (i !== baseDegree) {
        const allUsernames = Object.keys(allUsers);
        toSearch = new Set(
          allUsernames.filter((x) => !searched.has(x) && x !== 'null'),
        );
        for (const u of toSearch) {
          if (!(u in userDegrees)) curUserDegrees[u] = i;
        }
        setUserDegrees(curUserDegrees);
      }

      // if (!grow) {
      //   realUsername = matchUsername(allUsers);
      //   if (realUsername && realUsername !== displayUsername)
      //     setDisplayUsername(realUsername);
      // }

      // eslint-disable-next-line no-await-in-loop
      await searchDegree(toSearch).then((data) => {
        const [users, links, transactions] = data;

        // Add all new users from the search to allUsers.
        for (const username of Object.keys(users)) {
          if (!(username in allUsers)) allUsers[username] = users[username];
        }

        // Generate graph nodes by using the display names of allUsers.
        const graphUsers = Object.keys(allUsers).map((user) => {
          return { name: allUsers[user] };
        });

        for (const l of links) {
          const k = `${l.to}${l.from}`;
          if (!seenLinks.has(k)) {
            seenLinks.add(k);
            graphLinks.push(l);
          }
        }

        if (!grow) {
          setUserGraph({ nodes: graphUsers, links: [] });
          // https://github.com/vasturiano/react-force-graph/issues/238
          // setUserGraph({ nodes: graphUsers, links: graphLinks });
        }

        for (const t of data[2]) {
          const k = `${t.actor.username}${t.date}`;
          if (!seenTransactions.has(k)) {
            seenTransactions.add(k);
            curTransactions.push(t);
          }
        }
        setTransactions(curTransactions);
      });

      searched = new Set([...searched, ...toSearch]);
    }

    // get allusers keys
    const allUsersKeys = Object.keys(allUsers);
    for (const u of allUsersKeys) {
      if (!(u in curUserDegrees)) curUserDegrees[u] = baseDegree + degree;
    }

    // curUserDegrees[realUsername] = baseDegree;
    setUserDegrees(curUserDegrees);

    const users = Object.keys(allUsers).map((user) => {
      return { name: allUsers[user] };
    });

    if (users.length === 0 && !grow) {
      const usernameNodes: { [username: string]: string } = { name: username };
      setUserGraph({ nodes: [usernameNodes], links: [] });
      // setUserGraph({ nodes: [{ name: username }], links: [] });
    } else if (grow) {
      // const totalUsers = allUsers;
      // for (const x of userGraph.nodes) totalUsers.add(x.name);
      // const realTotalUsers = [];
      // for (const user of totalUsers) realTotalUsers.push({ name: user });

      // for (const x of userGraph.links) {
      //   links.push({ from: x.from, to: x.to, name: x.name });
      // }
      setUserGraph({ nodes: users, links: graphLinks });
    } else {
      setUserGraph({ nodes: users, links: graphLinks });
    }
  };

  /**
   * Wrapper function to add a user search to graph.
   * @param {string} username - the user to search and add to graph.
   */
  const addNode = (username: string) => {
    generateUserGraph(username, true);
  };

  /**
   * Function to convert dictionary of users to degrees into a sorted array of tuples
   * in the format [user, degree].
   * @param {object} degrees - dictionary of users to degrees.
   */
  const sortUserDegrees = (userDegrees: {
    string: number,
  }): Array<[string, number]> => {
    const items: Array<[string, number]> = Object.keys(userDegrees).map(
      (key) => [key, userDegrees[key]],
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
