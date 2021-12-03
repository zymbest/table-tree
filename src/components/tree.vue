<template>
  <div class="tree-graph-wrapper">
    <div class="tree-graph">
      <div :class="graphClass">
        <svg ref="svg" class="svg-layer"></svg>
        <!-- <div class="bulk-layer">
          <bulk 
            v-for="(node, key) in bulkData"
            :id="node.nodeId"
            :isBulk="isBulk"
            :key="generateBulkKey(bulkGeometrys[node.nodeId], key)" 
            :node="node"
            :geometry="bulkGeometrys[node.nodeId]"
            :bulkData="bulkData"
            :treeMap="treeMap"
            :isRead="isRead"
            :ref="node.nodeId" 
            @select="handleCardClick"
          />
        </div>
        <bulk-choose-tips :selectNode="selectNode" :isBulk="isBulk"/> -->
        <template v-if="isShow">
          <tr v-for="(x) in tableArray" :key="generateTrKey(x)">
            <td v-for="(node, yindex) in x" :key="yindex" :style="selectBulkColumnStyle(yindex)">
              <!-- <div v-if="xindex === 0"/> -->
              <slot v-if="node" :node="getSelectNode(node)"></slot>
            </td>
          </tr>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {min, max, isNil, flow, isEmpty, uniq} from 'lodash';
// eslint-disable-next-line no-unused-vars
import {genTreeStructure, genTreeCoordinate, genTableTree, treeDataMap, _treeDataMap} from '../utils/treeDataFactory';
// import Bulk from './bulk';
import { SVG } from '@svgdotjs/svg.js';
import rightArrow from '../assets/right.svg';
// import downArrow from '../assets/down.svg';

const defaultHeight = 58;
const bulkPadding = 12;

export default {
  name: 'TreeGraph',
  props: {
    treeData: [Array, Object],
    // bulkData: Array,
    // isBulk: Boolean,
    selectNode: Object,
    isRead: {
      type: Boolean,
      default: true,
    },
    graphScale: {
      type: Number,
      default: 1,
    },
    isNavigation: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    // Bulk,
  },
  data() {
    return {
      scale: this.graphScale,
      edge: [],
      draw: null,
      isDrawLine: false,
      bulkGeometrys: {},
      polylines: new Map(),
      gengTreeData: null,
    };
  },
  mounted() {
    const svgEl = this.$refs.svg;
    this.draw = SVG(svgEl);
  },
  computed: {
    isShow() {
      return !isEmpty(this.treeData);
    },
    treeEdge() {
      return this.treeCoordinate.edge;
    },
    treeCoordinate() {
      if (isEmpty(this.treeData)) return {};
      const _genTreeCoordinate = flow(genTreeStructure, genTreeCoordinate);
      return _genTreeCoordinate(this.treeData);
    },
    tableArray() {
      return genTableTree(this.treeCoordinate);
    },
    graphClass() {
      const graphClass = ['graph-table'];
      if (this.isBulk) {
        graphClass.push('bulk');
      }
      return graphClass;
    },
    graphStyle() {
      return {
        transform: `scale(${this.graphScale})`,
      };
    },
    watchData() {
      return {
        data: this.treeData,
        isBulk: this.isBulk,
      }
    },
    _selectNode() {
      if (!this.selectNode) return null;
      return treeDataMap.get(this.selectNode);
    },
  },
  watch: {
    watchData: {
      handler() {
        this.repaintGraph();
      },
      deep: true,
      immediate: true,
    },
    selectNode: {
      handler() {
        this.highlightLine();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    repaintGraph() {
      this.$nextTick(() => {
        this.drawLines();
        // this.calcBulkGeometrys();
      });
    },
    getSelectNode(_node) {
      return _treeDataMap.get(_node);
    },
    getParentSelectNode(node) {
      const _node = treeDataMap.get(node);
      console.log(treeDataMap);
      console.log(_node);
      const _parent = _node.parent;
      return _parent.map(item => {
        return _treeDataMap.get(item)
      });
      // return _treeDataMap.get(_parent) || null;
    },
    drawLines() {
      if (this.isDrawLine) {
        return;
      }
      this.isDrawLine = true;
      this.$nextTick(() => {
        this.draw.clear();
        this.polylines.clear();
        this.treeEdge.forEach((edge) => {
          const {source, target, isAddTarget} = edge;
          const sourceDom = this.$parent.$refs?.[source.id]?.$el;
          const targetDom = this.$parent.$refs?.[target.id]?.$el;
          if (!sourceDom || !targetDom) {
            // eslint-disable-next-line no-console
            console.warn('不存在dom节点');
            return;
          }
          const {offsetLeft: x1, offsetTop: y1, offsetWidth: width1} = sourceDom;
          const {offsetLeft: x2, offsetTop: y2} = targetDom;
          if (!isAddTarget) {
            const startx = x1 + width1;
            let starty = y1 + defaultHeight / 2;
            let endx = x2;
            let endy = y2 + defaultHeight / 2;
            const middlex = (startx + endx) / 2;
            const points = [startx, starty, middlex, starty, middlex, endy, endx, endy];
            const polyline = this.draw.polyline(points);
            this.draw.image(rightArrow).size(16, 16).move(middlex - 8, starty - 8);
            if (starty !== endy) {
              this.draw.image(rightArrow).size(16, 16).move(middlex, endy - 8);
            }
            this.polylines.set(edge, polyline);
          } else {
            const startx = x1 + width1 / 2;
            const starty = y1 + defaultHeight;
            const endx = x2;
            const endy = y2 + defaultHeight / 2;
            const points = [startx, starty, startx, endy, endx, endy];
            const polyline = this.draw.polyline(points);
            this.draw.image(rightArrow).size(16, 16).move(startx + 8, endy - 8);
            this.polylines.set(edge, polyline);
          }
        });
        this.highlightLine();
        this.isDrawLine = false;
      })
    },
    highlightLine() {
      const getParentNodes = (selectNode) => {
        if (!selectNode) return [];
        const parentNodes = [selectNode];
        const pushParentNode = (selectNode) => {
          if (selectNode.parent?.length) {
            selectNode.parent.forEach(item => {
              parentNodes.push(item);
              pushParentNode(item);
            })
          }
        }
        pushParentNode(selectNode);
        return parentNodes;
      }
      const highlight = (parentNodeIds) => {
        const frontLine = [];
        this.polylines.forEach((polyline, edge) => {
          const {target} = edge;
          let lineColor = '#EAEAEA';
          if (parentNodeIds.includes(target.id)) {
            lineColor = '#2f88ff';
            frontLine.push(polyline);
          }
          polyline.fill('none').stroke({ color: lineColor, width: 2});
        });
        frontLine.forEach((item) => item.front());
      };
      const parentNodes = getParentNodes(this._selectNode);
      const parentNodeIds = uniq(parentNodes.map(item => item.id));
      console.log(parentNodeIds);
      highlight(parentNodeIds);
    },
    calcBulkGeometrys() {
      const bulkGeometrys = this.bulkData.reduce((obj, bulk) => {
        const box = bulk.nodeIds.reduce((obj, item) => {
          if (this.$refs?.[item]?.[0]) {
            const dom = this.$refs[item][0].$el;
            const {offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height} = dom;
            return {
              x: [...obj.x, x, x + width],
              y: [...obj.y, y, y + height],
            };
          } else {
            return obj;
          }
        }, {x: [], y: []});
        let maxX = max(box.x) + bulkPadding;
        let minX = min(box.x) - bulkPadding;
        let maxY = max(box.y) + bulkPadding;
        let minY = min(box.y) - bulkPadding;
        return {
          ...obj,
          [bulk.nodeId]: {minX, minY, maxX, maxY},
        };
      }, {});
      this.bulkGeometrys = bulkGeometrys;
    },
    selectBulkColumnStyle(index) {
      const selectFirstNodeId = this.selectNode?.nodeIds?.[0];
      const columnIndex = this.treeMap?.[selectFirstNodeId]?.x;
      if (index === columnIndex) {
        return `background:#08D0A329; background-clip: content-box;`
      } else {
        return '';
      }
    },
    generateTrKey(tr) {
      if (!tr) return Math.random();
      const key = tr.reduce((str, item) => {
        const tdKey = !isNil(item) ? item?.id : '-';
        return `${str}${tdKey}`;
      }, '');
      return key;
    },
    generateBulkKey(bulkGeometry, index) {
      if (!bulkGeometry) return index;
      return `${bulkGeometry.maxX}${bulkGeometry.maxY}${bulkGeometry.minX}${bulkGeometry.minY}`
    }
  },
}
</script>

<style lang="less" scoped>
.tree-graph-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  .tree-graph {
    overflow: auto;
    position: relative;
    height: 100%;
    width: 100%;
    .graph-table {
      position: relative;
      transform-origin: 0px 0px;
      width: max-content;
      padding: 0;
      td {
        vertical-align: top;
        padding: 0 16px;
      }
      .svg-layer {
        position: absolute;
        top: 0;
        left: 0;
        height: 120%;
        width: 120%; 
        polyline {
          cursor: pointer;
        }
      }
    }
    .bulk {
      td:nth-child(1), td:nth-child(even) {
        background:#F4F4F4;
        background-clip: content-box;
      }
    }
  }
}
</style>
