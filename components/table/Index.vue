<script setup>
import { Table, Card, Button, Popconfirm, Divider, Form, Popover, Checkbox, Switch } from 'ant-design-vue'
import { usePagination } from '../../request/pagination.js'
import { computed, ref, h, useSlots, watch, useAttrs, capitalize, onUnmounted, onMounted } from 'vue'
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons-vue';
import md5 from 'blueimp-md5';
import _ from 'lodash'
import { functions } from 'nerio-js-utils'
import { useRoute } from 'vue-router';
import Filters from './filters.vue'
import { readonly } from 'vue';

const { useAsFunction } = functions

const props = defineProps({
  apiUrl: {
    type: String,
  },
  columns: {
    type: Array,
    required: true
  },
  actions: Array,
  requestMethod: {
    type: String,
    default: () => "POST"
  },
  pageSize: {
    type: Number,
    default: () => 15
  },
  title: String,
  buttons: Array,
  actionWidth: {
    type: [String, Number],
    default: () => 210
  },
  actionAlign: {
    type: String,
    default: () => 'center'
  },
  refreshable: {
    type: Boolean,
    default: () => true
  },
  searchData: {
    type: Object,
    default: () => ({})
  },
  dettached: {
    type: Boolean,
    default: () => true
  },
  autoload: {
    type: Boolean,
    default: () => true
  },
  sort: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: [Object, Array],
  },
  pk: {
    type: String,
    default: 'id'
  },
  initFilters: {
    type: [Object, Function],
    default: () => ({})
  },
  scroll: {
    type: Object
  },
  clearFilter: {
    type: Boolean
  },
  autoRefresh: {
    type: Boolean
  },
  refreshInterval: {
    type: Number
  },
  noCache: {
    type: Boolean,
    default: () => true
  },
  cacheKey: {
    type: String
  },
  filterLabelCol: {
    type: Object,
  },
  filterWrapperCol: {
    type: Object,
  },
  tableData: {
    type: [Array, Promise],
  },
  size: {
    type: String,
    default: () => 'middle'
  },
  bordered: {
    type: Boolean,
  },
  readonly: {
    type: Boolean,
    default: () => false
  },
  dense: {
    type: Boolean,
  }
})

const staticData = computed(() => !!props.tableData)

const readonlyState = computed(() => props.readonly)

const emit = defineEmits(['loaded', 'update:modelValue', 'resetFilter'])
const filters = ref(Object.assign({}, useAsFunction(props.initFilters)()))
const filterFormRef = ref()
const columnsState = computed(() => props.columns)

const showState = ref(columnsState.value.map(col => !col.hidden))

watch(() => columnsState.value, now => {
  showState.value = now.map(col => !col.hidden)
})

const sortState = ref(Object.assign({}, useAsFunction(props.sort)()))

const autoRefreshRef = ref(props.autoRefresh)

const refreshInterval = props.refreshInterval || 3000

const route = useRoute()

const pageKey = computed(() => {
  if (props.cacheKey) {
    return md5(route.fullPath + props.cacheKey)
  }


  return md5(route.fullPath + props.apiUrl + JSON.stringify(props.searchData))
})

const DataKey = "_TABLE_DATA_CACHE_"


function cacheTableData(data) {
  if (props.noCache) {
    return {}
  }
  const cacheKey = DataKey + pageKey.value

  const cache = JSON.parse(localStorage.getItem(cacheKey)) || {}

  if (data != undefined) {
    localStorage.setItem(cacheKey, JSON.stringify(Object.assign({}, cache, data)))
  }


  return cache
}


const { loading, meta, data: pageData, paginate, withoutPage, latency } = usePagination(emit, props.requestMethod)

const tableDataValue = ref([])

const dataSource = computed(() => {
  if (staticData.value) {
    return tableDataValue.value
  }

  return pageData.value
})


function loadStaticData() {
  Promise.resolve(props.tableData).then(resp => {
    tableDataValue.value = resp
  })
}

watch(() => props.tableData, now => {
  if (now) {
    loadStaticData()
  }
})

const refresh = (data = {}) => {
  if (staticData.value) {
    loadStaticData()
    return
  }
  const cache = cacheTableData()
  //console.log(filters.value, cache.filters)
  filters.value = Object.assign({}, filters.value, cache.filters)
  data.extra = Object.assign({}, data.extra, props.searchData)
  data.sort = data.sort || cache.sort || sortState.value || props.sort
  data.filters = data.filters || filters.value
  data.perPage = data.perPage || cache.perPage || props.pageSize
  data.page = data.page || cache.page
  //console.log('=======', filters.value, data)
  sortState.value = data.sort
  cacheTableData({
    perPage: data.perPage,
    sort: data.sort,
    page: data.page
  })

  return paginate(props.apiUrl, data)
}
props.autoload && refresh()

watch(() => props.searchData, (now, _old) => {
  const isSame = JSON.stringify(now) == JSON.stringify(_old)
  //console.log(now == _old, _.eq(now, _old), now, _old, isSame)

  isSame || refresh()
})

const pagination = computed(() => {
  if (withoutPage.value || staticData.value) {
    return false
  }

  return {
    total: meta.value.total,
    current: meta.value.page,
    pageSize: meta.value.per_page,
    defaultPageSize: props.pageSize,
    position: ['bottomRight'],
    pageSizeOptions: ['5', '10', '15', '20', '30', '50', '100'],
    showTotal: total => `共 ${total} 条记录（查询时间：${latency.value}ms）`,
    showSizeChanger: true
  }
})

const rowSelection = computed(() => {
  if (props.modelValue != undefined) {
    const value = _.clone(props.modelValue)
    const isArr = Array.isArray(props.modelValue)
    const srowKeys = []
    const srows = isArr ? value : [value]
    for (let i in srows) {
      srowKeys.push(srows[i][props.pk])
    }
    return {
      type: isArr ? 'checkbox' : 'radio',
      selectedRowKeys: srowKeys,
      onSelect: (record, selected) => {
        if (selected) {
          if (isArr) {
            value.push(record)
            emit('update:modelValue', value)
          } else {
            emit('update:modelValue', record)
          }
        } else {
          if (isArr) {
            value.splice(value.findIndex(item => item[props.pk] == record[props.pk]), 1)
            emit('update:modelValue', value)
          } else {
            emit('update:modelValue', null)
          }
        }
      },
      onSelectAll(selected, selectedRows, changeRows) {
        if (selected) {
          if (isArr) {
            emit('update:modelValue', value.concat(changeRows))
          } else {
            emit('update:modelValue', changeRows[0])
          }
        } else {
          if (isArr) {
            emit('update:modelValue', value.filter(item => !changeRows.find(row => row[props.pk] == item[props.pk])))
          } else {
            emit('update:modelValue', null)
          }
        }
      }
    }
  }

  return null
})

const attrs = useAttrs()

function callAction(action, ...args) {
  if (typeof action === 'function') {
    action.apply(null, args)
  } else if (typeof action === 'string') {
    const listener = attrs[`on${capitalize(action)}`]
    if (listener) {
      listener.apply(null, args)
    } else {
      emit(action, ...args)
    }
    // const res = emit(action, ...args)
    //console.log(res)
  } else {
    console.error(`invalid action ${action}`)
  }
}

const formatButtons = computed(() => {
  const buttons = props.buttons || []
  return buttons.map(btn => {
    return Object.assign({
      type: 'primary',
      size: 'middle',
      onClick: e => {
        if (btn.action) {
          callAction(btn.action)
        }
      },
    }, btn, {
      disabled: () => btn.disabled ? btn.disabled() : false
    })
  })
})

const formatColumns = computed(() => {
  const actions = props.actions || []
  const columns = _.clone(columnsState.value).filter((col, index) => {
    return showState.value[index]
  })
  if (actions.length > 0 && !props.readonly) {
    columns.push({
      key: 'action',
      actions: actions.map(action => {
        return Object.assign({
          onClick: (record) => callAction(action.action, record, refresh),
          size: "small",
          type: 'link'
        }, action, {
          disabled: (record) => action.disabled ? action.disabled(record) : false,
          show: (record) => action.show ? useAsFunction(action.show)(record) : true
        })
      }),
      fixed: 'right',
      title: '操作',
      width: props.actionWidth,
      align: props.actionAlign
    })
  }

  return columns.map(col => {
    const column = _.clone(col)
    if (column.dataIndex && column.dataIndex.indexOf('.') > -1) {
      column.dataIndex = column.dataIndex.split('.')
    }
    const render = column.customRender
    if (render) {
      column.customRender = (data) => {
        return render(data, callAction)
      }
    }

    let sortKey = getSortKey(column)

    if (sortState.value[sortKey]) {
      column.sortOrder = sortState.value[sortKey] == 'desc' ? 'descend' : 'ascend'
    } else {
      column.sortOrder = undefined
    }

    return column
  })
})

function getSortKey(column) {
  //console.log(column)
  let sortKey = Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex

  return sortKey
}

const handleTableChange = (data, filters, sorter) => {
  let sort = {}

  const col = columnsState.value.find(item => item.dataIndex == sorter.field)

  if (col) {
    delete (sort[sorter.field])
    const key = getSortKey(col)
    delete (sort[key])
    if (sorter.order != null) {
      sort[key] = sorter.order == "ascend" ? 'asc' : 'desc'
    }
  }

  //console.log(sort)
  sortState.value = sort

  //console.log(sorter, col, sort)
  refresh({
    perPage: data.pageSize,
    page: data.current,
    sort
  })
}

const applyFilters = () => {
  cacheTableData({ filters: filters.value })
  refresh({ filters: filters.value })
}

const resetFilters = () => {
  filters.value = props.clearFilter ? {} : Object.assign({}, useAsFunction(props.initFilters)())
  emit('resetFilter', filters.value)
  applyFilters()
}


watch(() => props.apiUrl, (nowVal) => {
  refresh()
})

defineExpose({ refresh, filters, resetFilters })
const slots = useSlots()

let refreshIntervalV


function setAutoRefresh() {
  if (autoRefreshRef.value) {
    if (!refreshIntervalV) {
      refreshIntervalV = setInterval(() => {
        refresh()
      }, refreshInterval)
    }
  } else {
    refreshIntervalV && clearInterval(refreshIntervalV)
  }
}

watch(() => autoRefreshRef.value, (nowVal) => {
  setAutoRefresh()
})

onUnmounted(() => {
  refreshIntervalV && clearInterval(refreshIntervalV)
})

onMounted(() => {
  setAutoRefresh()
})

</script>

<template>
  <div>
    <Card v-if="slots.filters && dettached" style="margin-bottom: 12px;" class="filter-card" :bordered="bordered"
      size="small">
      <Filters v-model="filters" @reset="resetFilters" @apply="applyFilters" :label-col="filterLabelCol"
        :wrapper-col="filterWrapperCol">
        <template #filters="{ filters }">
          <slot name="filters" :filters="filters"></slot>
        </template>
      </Filters>
    </Card>
    <Card :title="title" :bordered="bordered" class="table-card" :class="{ dense: dense }" size="small">

      <template #extra>
        <slot name="extra"></slot>
      </template>
      <template v-if="slots.filters && !dettached">
        <Filters v-model="filters" @reset="resetFilters" @apply="applyFilters" :label-col="filterLabelCol"
          :wrapper-col="filterWrapperCol">
          <template #filters="{ filters }">
            <slot name="filters" :filters="filters"></slot>
          </template>
        </Filters>
        <Divider />
      </template>

      <div class="table-btns" v-if="!readonlyState">
        <div>
          <Button :type="btn.type" :key="idx" v-for="(btn, idx) in formatButtons" @click="btn.onClick" :icon="btn.icon"
            :size="btn.size" :disabled="btn.disabled()">{{ btn.title }}</Button>
        </div>
        <div class="table-tools">
          <div v-if="refreshable">
            <ReloadOutlined @click="refresh" />
          </div>
          <div>
            <Popover placement="bottomRight" trigger="click">
              <template #content>
                <div class="table-columns-setting">
                  <div v-for="(col, idx) in columnsState" :key="col.dataIndex">
                    <Checkbox v-model:checked="showState[idx]"></Checkbox> {{ col.title }}
                  </div>
                </div>
                <div class="flex">
                  <span>自动刷新：</span>
                  <Switch v-model:checked="autoRefreshRef"></Switch>
                </div>
              </template>
              <template #title>
                <span>列显示设置</span>
              </template>
              <SettingOutlined></SettingOutlined>
            </Popover>
          </div>
          <slot name="tools"></slot>
        </div>
      </div>

      <Table @change="handleTableChange" :expand-column-width="100" :columns="formatColumns" :data-source="dataSource"
        :loading="loading" :pagination="pagination" :row-selection="rowSelection" :scroll="scroll" v-bind="attrs"
        bordered :size="size" :rowKey="pk">

        <template #bodyCell="{ column, record }">
          <template v-if="column && column.key === 'action'">
            <template :key="idx" v-for="(action, idx) in column.actions">
              <template v-if="action.show(record)">
                <Popconfirm v-if="action.confirm && !action.disabled(record)" @confirm="action.onClick(record)"
                  :title="action.confirm(record)">
                  <Button class="table-action-btn" :type="action.type" :icon="action.icon" :size="action.size"
                    :danger="action.danger" :disabled="action.disabled(record)" :loading="action.loading">{{
                    action.title }}</Button>
                </Popconfirm>
                <Button class="table-action-btn" v-else :type="action.type" @click="action.onClick(record)"
                  :icon="action.icon" :size="action.size" :danger="action.danger" :disabled="action.disabled(record)"
                  :loading="action.loading">{{
                    action.title }}</Button>
              </template>
            </template>
          </template>
          <template v-for="col in formatColumns">
            <template v-if="column.dataIndex === col.dataIndex && col.slot && slots[col.slot]">
              <slot :name="col.slot" :column="column" :record="record"></slot>
            </template>
          </template>
        </template>
        <template #expandedRowRender="{ record }" v-if="slots.expanded">
          <slot name="expanded" :record="record"></slot>
        </template>

        <template #expandColumnTitle v-if="slots.expanded">
          <span>展开</span>
        </template>
      </Table>
    </Card>
    <slot></slot>
  </div>
</template>
<style lang="scss" scoped>
.table-btns {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;

  >div {
    button+button {
      margin-left: 6px;
    }

    display: inline-flex;
  }


}

.table-columns-setting {
  max-height: 450px;
  overflow-y: auto;
  min-width: 300px;

  >div {
    padding: 2px 0;
  }
}

.table-action-btn.ant-btn-sm {
  font-size: 13px;
}

.filter-card,
.table-card {
  :deep(.ant-card-body) {
    padding: 8px;
  }

  &.dense {
    :deep(.ant-card-body) {
      padding: 0;
    }
  }

  :deep(.ant-pagination) {
    padding: 12px 8px;
    margin: 0;
    border-radius: 0 0 12px 12px;
    border: 1px solid #f0f0f0;
    border-top: none;
  }
}

.table-card {
  :deep(table) {
    border-radius: 12px;
  }
}
</style>

<style lang="scss">
.table-tools {
  display: flex;
  justify-items: center;
  align-items: center;

  >div {
    margin-left: 12px;
    font-size: 18px;
  }
}
</style>