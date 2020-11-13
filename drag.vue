<template>
    <div class="container" @mouseleave="moveTableOutside">
        <el-table
            ref="multipleTable"
            class="drag_table"
            :show-summary="showTotal"
            :data="tableData"
            tooltip-effect="dark"
            border
            style="width: 100%;"
            :cell-class-name="cellClassName" 
            :header-cell-class-name="headerCellClassName"
            @selection-change="handleSelectionChange">
            <el-table-column
            type="selection"
            v-if="showSelect"
            width="55">
            </el-table-column>
            <el-table-column
              align="center"
              v-for="(item, index) in tableConfig" 
              :render-header="renderHeader"
              :column-key="index.toString()"
              :key="index"
              :prop="item.prop"
              :label="item.label"
              :sortable="item.sortable"
              :width="item.width || '120'">
              <template slot-scope="scope" :name="item.prop">
                    <div v-if="item.prop=='pause'">
                      <el-button
                        v-if="scope.row.pause == 1"
                        size="small"
                        type="warning"
                        @click="handleEnable(scope.row, scope.$index)">暂停</el-button>
                      <el-button
                        v-if="scope.row.pause == 2"
                        size="small"
                        type="success"
                        @click="handleEnable(scope.row, scope.$index)">启用</el-button>
                    </div>
                    <div v-else>
                      <span v-if="item.render">{{ item.render(scope.row) == 0 ? '0' : item.render(scope.row) || '--' }}</span>
                      <span v-else>{{ scope.row[item.prop] == 0 ? '0' : scope.row[item.prop] || '--' }}</span>
                    </div>
              </template>
            </el-table-column>
            <el-table-column
            align="center"
            v-if="isHandle"
            label="操作"
            min-width="210">
            <template slot-scope="scope">
              <el-button
              v-if="isHandle.detail"
              size="small"
              type="primary"
              @click="handleDetail(scope.row, scope.$index)">详情</el-button>
              <el-button
              v-if="isHandle.edit"
              size="small"
              type="success"
              @click="handleEdit(scope.row, scope.$index)">编辑</el-button>
              <el-button
              v-if="isHandle.downLoad"
              size="small"
              @click="handleEdit(scope.row, scope.$index)">下载</el-button>
              <el-button
              v-if="isHandle.delete"
              size="small"
              type="danger"
              @click="handleDelete(scope.row, scope.$index)">删除</el-button>
            </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
    name: 'commonTable',
    props: {
      tableConfig: {
        type: Array,
        default: []
      },
      tableData: {
        type: Array,
        default: []
      },
      showSelect: {
        type: Boolean,
        default: true
      },
      isHandle: {
        type: Object,
        default: () => {}
      },
      showTotal: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dragState: {
            startIndex: -1, // 拖动起始元素的index
            endIndex: -1, // 拖动结束元素的index
            afterMoveIndex: -1, // 拖动后元素的index
            dragging: false, // 是否正在拖动
            direction: null, // 拖动方向
            moveTableOutsideBack: false // 拖出到table外之后又拖回来
        }
      };
    },
    methods: {
      // 多选
      handleSelectionChange(val) {
        this.$emit('selTable', val)
      },
      // 详情
      handleDetail(row, index) {
        this.$emit('detailTable', row)
      },
      // 编辑
      handleEdit(row, index) {
        this.$emit('editTable', row)
      },
      // 删除
      handleDelete(row, index) {
        this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('delTable', row)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      // 启用
      handleEnable(row, index) {
        this.$emit('enable', row)
      },
      headerCellClassName({
          column,
          columnIndex
      }) {
          console.log(1111111)
          return columnIndex === this.dragState.afterMoveIndex ? `drag_active_${this.dragState.direction}` : ''
      },
      // 动态给表头单元格th添加class，实现拖动中的背景
      cellClassName({
          column,
          columnIndex
      }) {
          console.log(22222)
          return (columnIndex === this.dragState.startIndex ? `dragging_column` : '')
      },
      // drag_table在渲染表头时调用
      renderHeader(h, {
          column,
          $index
      }) {
          // 这里可以根据$index的值来对自身需求进行修改，
          return h('span', {
              'class': ['thead-cell'],
              style: {
                  'display': 'block',
                  'width': '100%',
                  'cursor': 'move',
              },
              on: {
                  mousedown: ($event) => {
                      this.handleMouseDown($event, column)
                  },
                  mouseup: ($event) => {
                      this.handleMouseUp($event, column)
                  },
                  mousemove: ($event) => {
                      this.handleMouseMove($event, column)
                  }
              }
          }, [
              h('span', [
                  // 给每个表头添加icon 可以不需要
                  // h('span', {
                  //     class: $index === 0 ? 'el-icon-star-off' : $index === 1 ? 'el-icon-time' : $index === 2 ? 'el-icon-location' : '',
                  // }),
                  h('span', column.label)
              ]),
              // 给每个表头添加一个class=virtual 是画虚线的类名。
              h('span', {
                  'class': ['virtual']
              })
          ])
      },
            // 按下鼠标开始拖动 设置列的背景色
            handleMouseDown(e, column) {
                // 判断是鼠标左键
                if (e.button === 0) {
                    this.dragState.dragging = true
                    this.dragState.startIndex = parseInt(column.columnKey)
                    console.log(`开始移动的位置 ${this.dragState.startIndex}`)
                    // 给当前要拖动列的th设置class
                    document.querySelectorAll('.drag_table table thead tr th')[this.dragState.startIndex].className += ' ' + 'dragging_column';
                    // 给拖动时的虚拟容器添加宽高                    
                    let table = document.getElementsByClassName('drag_table')[0]
                    let virtual = document.getElementsByClassName('virtual')
                    // 设置新插入的span.virtual的标签 每一列的宽度、高度
                    for (let item of virtual) {
                        item.style.height = table.clientHeight - 1 + 'px'
                        item.style.width = item.parentElement.parentElement.clientWidth + 'px'
                    }
                    this.dragState.moveTableOutsideBack = false
                }
            },
            // 拖动中
            handleMouseMove(e, column) {
                // 判断是鼠标左键
                if (e.button === 0) {
                    if (this.dragState.dragging) {
                        let currentIndex = parseInt(column.columnKey) // 拖动的当前列index
                        console.log(`移动到了${currentIndex}`)
                        if (currentIndex !== this.dragState.startIndex) {
                            this.dragState.direction = currentIndex - this.dragState.startIndex < 0 ? 'left' : 'right' // 判断拖动方向
                            this.dragState.afterMoveIndex = currentIndex
                        } else {
                            this.dragState.direction = null
                        }
                    } else {
                        return false
                    }
                }
            },
            // 鼠标放开结束拖动
            handleMouseUp(e, column) {
                // 判断是鼠标左键
                if (e.button === 0) {
                    // 拖出当前table外之后又拖回来，不再进行易位操作（拖出去时已处理）
                    if (this.dragState.moveTableOutsideBack) {
                        return false
                    } else {
                        this.dragState.endIndex = parseInt(column.columnKey) // 记录结束列index
                        console.log(`结束移动的位置 ${this.dragState.endIndex}`)
                        if (this.dragState.startIndex !== this.dragState.endIndex) {
                            this.dragColumn(this.dragState)
                        }
                        this.finishDragInit()
                    }
                }
            },
            // 拖动到当前table之外的处理
            moveTableOutside() {
                if (this.dragState.dragging) {
                    this.dragState.endIndex = this.dragState.startIndex
                    console.log(`已移动到table外，结束移动的位置 ${this.dragState.endIndex}`)
                    if (this.dragState.startIndex !== this.dragState.endIndex) {
                        this.dragColumn(this.dragState)
                    }
                    this.finishDragInit()
                    this.dragState.moveTableOutsideBack = true
                }
            },
            // 拖动易位
            dragColumn({
                startIndex,
                endIndex,
                direction
            }) {
                console.log(`从${startIndex}移动到了${endIndex}`)
                // 排除掉鼠标点击table外面，然后拖入进table报错
                if (startIndex < 0) {
                    return;
                }
                // 判断是向左移动还是向右移动
                // 把移动的列插在某个列前面或者后面，然后在删除移动的列
                if (direction === 'left') {
                    this.tableConfig.splice(endIndex, 0, this.tableConfig[startIndex])
                    this.tableConfig.splice(startIndex + 1, 1)
                } else {
                    this.tableConfig.splice(endIndex + 1, 0, this.tableConfig[startIndex])
                    this.tableConfig.splice(startIndex, 1)
                }
            },
            // 拖动完成后的初始化
            finishDragInit() {
                // 给当前要拖动列的th取消class
                for (var item of document.querySelectorAll('.drag_table table thead tr th')) {
                    item.className = String(item.className).split("dragging_column").join("");
                }
                // 再次初始化拖动状态
                this.dragState = {
                    startIndex: -1,
                    endIndex: -1,
                    afterMoveIndex: -1,
                    dragging: false,
                    direction: null,
                    moveTableOutsideBack: false
                }
            },
    }
}
</script>
<style scoped>
.thead-cell{
    position: relative;
}
.drag_table th {
    cursor: move;
}
.virtual {
    position: fixed;
    display: block;
    margin-top: -35px;
    margin-left: -11px; 
}
.drag_active_left .virtual {
    border-left: 1px dotted #666;
    z-index: 99;
}
.drag_active_right .virtual {
    border-right: 1px dotted #666;
    z-index: 99;
}
/* 
    给选中要拖动的列添加背景色，如果在完整项目内部的组件，所以这个组件的style，不能加scoped,否则添加不上样式
    如果使用了sass或者less,可以加scoped 然后在用特殊手法处理样式
*/
.dragging_column {
    background-color: #f3f3f3 !important;
}
</style>
