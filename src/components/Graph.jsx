// @flow
import React, { useState, useLayoutEffect } from 'react';
import type { Node } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';

import type { GraphData } from '../types';

type Props = {
  graph: GraphData,
  addNode: (string) => void,
};

function Graph(props: Props): Node {
  const { graph, addNode } = props;

  const [cursor, setCursor] = useState('default');

  function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }

  const [, height] = useWindowSize();

  return (
    <div style={{ cursor }}>
      <ForceGraph3D
        height={height}
        graphData={graph}
        nodeId="name"
        linkSource="from"
        linkTarget="to"
        backgroundColor="#000000"
        enableNodeDrag={false}
        nodeAutoColorBy="name"
        linkAutoColorBy="from"
        linkWidth={1.5}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={1}
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.name);
          sprite.color = node.color;
          sprite.textHeight = 4;
          sprite.position.y = -8;
          return sprite;
        }}
        nodeThreeObjectExtend
        nodeRelSize={3}
        onNodeClick={(value) => {
          addNode(value.name);
        }}
        nodeLabel=""
        onNodeHover={(node) =>
          node ? setCursor('pointer') : setCursor('default')
        }
      />
    </div>
  );
}

export default Graph;
