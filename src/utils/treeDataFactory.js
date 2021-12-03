// eslint-disable-next-line no-unused-vars
import {cloneDeep, max, flow} from 'lodash';

let _treeData = {};

export let treeDataMap = new WeakMap();
export let _treeDataMap = new WeakMap();

export const genTreeMap = (data) => {
  console.log(data);
  return data.reduce((obj, item) => {
    return Object.assign(obj, {
      [item.nodeId]: item
    })
  }, {})
}

export const genTreeStructure = (treeData) => {
  _treeData = cloneDeep(treeData);
  _treeData.parent = null;
  treeDataMap = new WeakMap();
  _treeDataMap = new WeakMap();

  const markParent = (_xData, xData) => {
    const _queue = [];
    const queue = [];
    _queue.unshift(_xData);
    queue.unshift(xData);

    while(_queue.length) {
      const _parent = _queue.pop();
      const parent = queue.pop();
      treeDataMap.set(parent, _parent);
      _treeDataMap.set(_parent, parent);
      if (_parent.children?.length) {
        _parent.children.forEach(child => {
          if (child?.parent?.length) {
            child.parent.push(_parent);
          } else {
            child.parent = [_parent];
          }
          _queue.unshift(child);
        })
      }
      if (parent.children?.length) {
        parent.children.forEach(child => {
          queue.unshift(child);
        })
      }
    }
  }

  markParent(_treeData, treeData);
  console.log(treeDataMap);
  return _treeData;
}


 export const genTreeCoordinate = (treeStructure) => {
   console.log(treeStructure)
  const edge = [];
  const treeMap = {};

  let maxX = 0;
  let maxY = 0;
  let deepY = 0;

  function travel(node, x, y) {
    node.x = x;
    node.y = y;
    maxX = max([x, maxX]);
    maxY = max([y, maxY]);
    deepY = max([y, deepY]);
    if (treeMap?.[node.id]) {
      console.log(node.parent);
      const _node = treeMap[node.id];
      console.log(_node.parent);
      treeMap[node.id].x =  max([treeMap[node.id].x, node.x]);
      // treeMap[node.id].y =  max([treeMap[node.id].y, node.y]);
      treeMap[node.id].parent.push(node.parent[0]);
    } else {
      treeMap[node.id] = node;
      if (node.children?.length) {
        node.children.forEach((item, index) => {
          let nextY = y + index;
          if (deepY > y) {
            nextY = deepY + 1;
          }
          edge.push({
            source: node,
            target: item,
            isAddTarget: !!treeMap[item.id]
          })
          travel(item, x + 1, nextY)
        })
      }
    }
  }
  travel(treeStructure, 0, 1);

  console.log(edge);
  console.log(treeMap);
  return {
    edge,
    treeMap,
    maxX,
    maxY,
  }
}

export const genTableTree = (treeCoordinate) => {
  const tableArray = Object.values(treeCoordinate.treeMap);
  let maxX = treeCoordinate.maxX;
  let maxY = treeCoordinate.maxY;
  
  const arrayTable = new Array(maxY + 1).fill(null).map(() => new Array(maxX + 1).fill(null));
  tableArray.forEach((item) => {
    arrayTable[item.y][item.x] = item;
  });
  return arrayTable.filter(row => {
    return row.some(item => !!item);
  })
}

export const genRenderTableArray = flow(genTreeStructure, genTreeCoordinate, genTableTree);


