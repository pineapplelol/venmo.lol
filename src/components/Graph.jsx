// @flow
import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { notification } from 'antd';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';

import type { GraphData } from '../types';

type Props = {
  graph: GraphData,
  addNode: (string) => void,
};

const highlightColor = '#fff';
const defaultColor = 'grey';
const colors = [
  '#E0ACD5',
  '#3993DD',
  '#FF6392',
  '#F3A712',
  '#DB2B39',
  '#DBFE87',
];

function Graph(props: Props): Node {
  const { graph, addNode } = props;

  const [cursor, setCursor] = useState('default');
  const [highlightNodes] = useState(new Set());
  const [highlightLinks] = useState(new Set());
  const [linkColors, setLinkColors] = useState({});

  useEffect(() => {
    graph.nodes = graph.nodes.map((node) => {
      const filteredLinks = graph.links.filter(
        (link) => link.from === node.name || link.to === node.name,
      );
      const neighbors = filteredLinks.map((link) =>
        link.from === node.name ? link.to : link.from,
      );
      const links = filteredLinks.map((link) => link.name);

      for (const link of links) {
        if (!linkColors[link] || linkColors[link].degree > node.degree) {
          linkColors[link] = {
            color:
              node.degree !== null && node.degree !== undefined
                ? colors[node.degree]
                : defaultColor,
            degree: node.degree,
          };
        }
      }
      setLinkColors(linkColors);
      return { ...node, neighbors, links };
    });
  }, [graph]);

  const openCopiedNotification = () => {
    notification.success({
      description: `Venmo transaction copied to clipboard!`,
      duration: 2,
    });
  };

  const getNodeColor = (node) =>
    highlightNodes.has(node.name) ? highlightColor : colors[node.degree];

  const getLinkColor = (link) => {
    if (highlightLinks.has(link.name)) return highlightColor;
    if (linkColors[link.name]) return linkColors[link.name].color;
    return defaultColor;
  };

  const useWindowSize = (): [number, number] => {
    const [size, setSize] = useState([0, 0]);
    useEffect(() => {
      const updateSize = () => {
        setSize([window.innerWidth, window.innerHeight]);
      };
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  };

  const [, height] = useWindowSize();

  return (
    <div style={{ cursor }}>
      <ForceGraph3D
        ref={(g) => {
          if (g) {
            g.d3Force('link').distance(25);
            g.d3Force('charge').strength(-40);
          }
        }}
        height={height}
        graphData={graph}
        nodeId="name"
        linkSource="from"
        linkTarget="to"
        backgroundColor="#000000"
        enableNodeDrag={false}
        nodeColor={getNodeColor}
        linkColor={getLinkColor}
        linkWidth={1.5}
        linkDirectionalParticles={(link) =>
          highlightLinks.has(link.name) ? 4 : 1
        }
        linkDirectionalParticleWidth={1}
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.name);
          sprite.color = getNodeColor(node);
          sprite.textHeight = 4;
          sprite.position.y = -8;
          return sprite;
        }}
        nodeThreeObjectExtend
        nodeRelSize={3}
        onNodeClick={(value) => addNode(value.username)}
        nodeLabel=""
        onNodeHover={(node) => {
          setCursor(node ? 'pointer' : 'default');
          highlightNodes.clear();
          highlightLinks.clear();
          if (node) {
            highlightNodes.add(node.name);
            node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
            node.links.forEach((link) => highlightLinks.add(link));
          }
        }}
        onLinkHover={(link) => {
          setCursor(link ? 'pointer' : 'default');
          highlightNodes.clear();
          highlightLinks.clear();
          if (link) {
            highlightLinks.add(link.name);
            highlightNodes.add(link.from);
            highlightNodes.add(link.to);
          }
        }}
        onLinkClick={(link) => {
          navigator.clipboard.writeText(link.name);
          openCopiedNotification();
        }}
      />
    </div>
  );
}

export default Graph;
