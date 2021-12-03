<template>
  <div id="app">
    <button @click="handleAddNode">添加节点</button>
    <button @click="handleDeleteNode">删除节点</button>
    <button @click="handleEditNode">修改节点</button>
    <tree-graph ref="treeGraph" :treeData="treeData" :selectNode="selectNode" >
      <card slot-scope="scope"
        :id="scope.node.id"
        :ref="scope.node.id"
        :node="scope.node"
        :isSelect="getSelectNode(scope.node)"
        @click.native="handleClickCard(scope.node)"
      />
    </tree-graph>
  </div>
</template>

<script>
import TreeGraph from './components/tree.vue';
import Card from './components/card.vue';
import {findIndex} from 'lodash';

let nextId = 30;

const getNextId = () => {
  return nextId ++;
} 

export default {
  name: 'App',
  components: {
    TreeGraph,
    Card,
  },
  data() {
    return {
      selectNode: null,
      treeData: {},
    }
  },
  mounted() {
    this.treeData = require('./assets/new-mock.json');
  },
  methods: {
    getTreeMap(data) {
      return data.reduce((obj, item) => {
        return Object.assign(obj, {
          [item.nodeId]: item
        })
      }, {})
    },
    handleClickCard(node) {
      this.selectNode = node;
    },
    getSelectNode(node) {
      return this.selectNode?.id === node?.id;
    },
    handleAddNode() {
      const node = {
        id: getNextId(),
        children: [],
        text: '添加的节点'
      };

      this.selectNode.children.push(node);
    },
    handleDeleteNode() {
      const parent =  this.$refs['treeGraph'].getParentSelectNode(this.selectNode);
      parent.forEach(par => {
        const index = findIndex(par.children, (item) => item.id === this.selectNode.id);
        par.children.splice(index, 1);
      })
    },
    handleEditNode() {
      this.selectNode.text = '修改了节点';
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
