// @flow
import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';

import Graph from '../components/Graph';
import Sidebar from '../components/Sidebar';
import { getUserTransactions } from '../util/api';
import '../css/UserGraph.css';

const { Content } = Layout;

type Props = {
  pageUser: string,
};

function UserGraph(props: Props) {
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
  const matchUsername = allUsers => {
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
   */
  const searchDegree = async toSearch => {
    const users = new Set();
    const links = [];
    const curTransactions = [];

    const searches = [];
    for (const user of toSearch) searches.push(getUserTransactions(user));

    await Promise.all(searches).then(allData => {
      for (const data of allData) {
        for (const t of data) {
          users.add(t.sender);
          users.add(t.recipient);
          links.push({
            from: t.sender,
            to: t.recipient,
            name: `${t.sender} to ${t.recipient}: ${t.message}`,
          });
          curTransactions.push(t);
        }
      }
    });

    return [users, links, curTransactions];
  };

  /**
   * Will generate a user graph to be displayed given a username. Searches to degree of 3
   * for a given user.
   * @param {string} username - the user to for which the graph will be generated.
   * @param {boolean} grow - if there is an existing graph to add to. Will not change
   *                       the user degrees.
   * @param {number} degree - the degree to search to for the username.
   */
  const generateUserGraph = async (username, grow = false, degree = 3) => {
    let allUsers = new Set();
    let searched = new Set();
    let toSearch = new Set([username]);
    const curUserDegrees = grow ? userDegrees : {};

    const seenLinks = new Set();
    const links = [];

    const seenTransactions = new Set();
    const curTransactions = [];

    const baseDegree = userDegrees[username] ?? 0;
    for (let i = baseDegree; i < baseDegree + degree; i += 1) {
      if (i !== baseDegree) {
        toSearch = new Set([...allUsers].filter(x => !searched.has(x)));
        for (const u of toSearch) {
          if (!(u in userDegrees)) curUserDegrees[u] = i;
        }
        setUserDegrees(curUserDegrees);
      }

      if (!grow) {
        const realUsername = matchUsername(allUsers);
        if (realUsername && realUsername !== displayUsername)
          setDisplayUsername(realUsername);
      }

      // eslint-disable-next-line no-await-in-loop
      await searchDegree(toSearch).then(data => {
        allUsers = new Set([...allUsers, ...data[0]]);

        const users = [];
        for (const user of allUsers) users.push({ name: user });

        for (const l of data[1]) {
          const k = `${l.to}${l.from}`;
          if (!seenLinks.has(k)) {
            seenLinks.add(k);
            links.push(l);
          }
        }
        if (!grow) setUserGraph({ nodes: users, links: [] });
        // https://github.com/vasturiano/react-force-graph/issues/238
        // setUserGraph({ nodes: users, links: [...links] });

        for (const t of data[2]) {
          const k = `${t.sender}${t.date}`;
          if (!seenTransactions.has(k)) {
            seenTransactions.add(k);
            curTransactions.push(t);
          }
        }
        setTransactions(curTransactions);
      });

      searched = new Set([...searched, ...toSearch]);
    }

    for (const u of allUsers) {
      if (!(u in curUserDegrees)) curUserDegrees[u] = baseDegree + degree;
    }
    curUserDegrees[username] = baseDegree;
    setUserDegrees(curUserDegrees);

    const users = [];
    for (const user of allUsers) users.push({ name: user });

    if (users.length === 0 && !grow) {
      setUserGraph({ nodes: [{ name: username }], links: [] });
    } else {
      if (grow) {
        const totalUsers = allUsers;
        for (const x of userGraph.nodes) totalUsers.add(x.name);
        const realTotalUsers = [];
        for (const user of totalUsers) realTotalUsers.push({ name: user });

        for (const x of userGraph.links) {
          links.push({ from: x.from, to: x.to, name: x.name });
        }
        setUserGraph({ nodes: realTotalUsers, links });
      } else {
        setUserGraph({ nodes: users, links });
      }
    }
  };

  /**
   * Wrapper function to add a user search to graph.
   * @param {string} username - the user to search and add to graph.
   */
  const addNode = (username: string) => {
    generateUserGraph(username, true);
  };

  useEffect(() => {
    generateUserGraph(pageUser);
  }, [pageUser]);

  return (
    <Layout>
      <Sidebar
        username={pageUser}
        userDegrees={userDegrees}
        transactions={transactions}
      />
      <Content className="graph">
        <Graph graph={userGraph} addNode={addNode} />
      </Content>
    </Layout>
  );
}

export default UserGraph;
