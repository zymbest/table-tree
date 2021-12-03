<template>
  <div class="card" :style="style">
    <div class="title">{{id}}</div>
    <div class="body">{{nodeText}}</div>
    <!-- <div v-if="content" class="body">{{content}}</div> -->
    <!-- <div v-if="isBulk && type !== 3" class="mask" @click.stop="handleBlukSelect"></div> -->
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    id: [Number, String],
    node: Object,
    isSelect: Boolean,
  },
  data() {
    return {
      isBulkSelect: false,
    }
  },
  computed: {
    checkOneFill() {
      if (this.isBulkSelect) {
        return ['#6AFF23' ,'#6AFF23' ,'#ffffff' ,'#6AFF23'];
      } else {
        return ['#33333366' ,'#33333366' ,'#fff' ,'#33333366'];
      }
    },
    nodeText() {
      return this.node?.text || '';
    },
    style() {
      if (this.isSelect){
        return {'border-color': 'black !important'};
      }
      return {
          // background: this.color || '#027AFF',
          // 'box-shadow': `0px 4px 12px ${this.color}34`,
          // color: this.fontColor || 'white',
          // 'border-color': this.color || '#027AFF',
        };
    },
  },
  methods: {
    handleBlukSelect() {
      this.isBulkSelect = !this.isBulkSelect;
      this.$emit('bluk-select', this.item);
    },
  },
}
</script>

<style lang="less" scoped>
.card {
  width: 180px;
  box-shadow: 0px 4px 12px rgba(2, 122, 255, 0.24);
  border-radius: 4px;
  text-align: left;
  color: white;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
  border-style: solid;
  border-width: 2px;
  margin: 16px 0;
  position: relative;
  background: #027AFF;
  color: white;
  border-color: #027AFF;
  z-index: 10;
  cursor: pointer;
  .title {
    font-size: 12px;
    margin-bottom: 2px;
    line-height: 20px;
    font-weight: 500;
  }
  .body {
    word-break: break-all;
  }
  .close-one-icon {
    position: absolute;
    right: -8px;
    top: -8px;
    box-shadow: 0px 4px 15px #33333331;
    border-radius: 8px;
    cursor: pointer;
    display: none;
    height: 16px;
    /deep/ .byted-icon {
      vertical-align: initial;
    }
  }
  &:hover {
    border-color: black !important;
    .close-one-icon {
      display: block;
    }
  }
  .mask {
    background: rgba(51, 51, 51, 0.4);
    width: calc(100% + 4px);
    top: -2px;
    left: -2px;
    border-radius: 4px;
    height: calc(100% + 4px);
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .check-icon {
    cursor: pointer;
  }
}
</style>