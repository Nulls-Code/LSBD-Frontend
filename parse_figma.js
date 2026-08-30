const fs = require('fs');

async function getFullFigmaTree() {
  const token = 'figd_BhZ8E0w9uGF6gES5zXXOMJDW1s961LLBGLzH6Prx';
  const fileId = 'PdaiuqanzBpTpMryB5ZZIj';
  const nodeId = '1:489';

  const res = await fetch(`https://api.figma.com/v1/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}`, {
    headers: { 'X-Figma-Token': token }
  });

  const data = await res.json();
  const root = data.nodes['1:489'].document;

  function walk(node, depth = 0) {
    const indent = '  '.repeat(depth);
    let str = `${indent}- [${node.type}] ${node.name}`;
    if (node.characters) {
      str += `: "${node.characters.replace(/\n/g, ' ')}"`;
    }
    if (node.fills && node.fills.length > 0) {
      const f = node.fills[0];
      if (f.color) {
        const r = Math.round(f.color.r * 255);
        const g = Math.round(f.color.g * 255);
        const b = Math.round(f.color.b * 255);
        str += ` (color: rgb(${r},${g},${b}))`;
      }
    }
    console.log(str);
    if (node.children) {
      for (const child of node.children) {
        walk(child, depth + 1);
      }
    }
  }

  walk(root);
}

getFullFigmaTree().catch(console.error);
