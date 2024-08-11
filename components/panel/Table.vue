<script setup>
import Table from '../table/Index.vue'
import request from '../../request'
import { FormItem, Col, Row, message, Switch, Card } from 'ant-design-vue'
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import ModalForm from '../form/ModalForm.vue'
import { computed, h, onMounted, ref, useSlots } from 'vue'
import { fmtDatetime } from '../../utils/date.js'
import { replaceParams } from '../../utils/functions.js'
import { functions } from 'nerio-js-utils'
import { useResolver } from './resolver'
const { useAsFunction } = functions
import _ from 'lodash'
import { useForm, renderFormComponent, renderFilterComponent } from './form'
import { usePanelStore } from "./index.js"

const { hasFormComponent, hasFilterComponent, getIndex, hasIndex } = usePanelStore()

const props = defineProps({
  index: {
    type: String,
    required: true
  },
  expandable: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
  },
  postData: {
    type: Object,
  },
  addDisabled: {
    type: Boolean,
  },
  disabledFilters: {
    type: Array,
    default: () => []
  }
})

const indexDef = computed(() => {
  const indexFn = getIndex(props.index)
  return indexFn ? indexFn() : {}
})

const toggleUrl = computed(() => {
  return indexDef.value.toggleUrl || `/${indexDef.value.apiUrl}/toggle/:id`
})

const { modalOpen, modalRef, openModal, openEdit, submitted, modalTitle, post, tableRef } = useForm(indexDef.value?.post?.name, () => {
  return Object.assign({}, indexDef.value?.post?.default, props.postData)
})

const mapsCache = ref({})
const { parseFnString, callfn, withResolver } = useResolver(() => mapsCache.value)

withResolver("map", (val, prop) => {
  if (['string', 'number'].indexOf(typeof val) > -1) {
    try {
      return mapsCache.value[prop][val]
    } catch (e) {

    }
  }
  return val
})

const mapArray = computed(() => {
  return Object.keys(mapsCache.value).reduce((res, key) => {
    const map = mapsCache.value[key]
    if (map) {
      res[key] = []
      for (let k in map) {
        res[key].push({
          value: isNaN(k) ? k : parseInt(k),
          text: map[k]
        })
      }
    }

    return res
  }, {})
})

function loadMap(prop) {
  if (!mapsCache.value[prop]) {
    mapsCache.value[prop] = {}
    let map = _.clone(indexDef.value.maps[prop])
    if (map) {
      let getter = map
      if (Array.isArray(map)) {
        getter = map.shift()
      }

      /**
       * getter: 
       *  fn() > Promise(resp)
       *  object(key:value)
       *  'api:dict.getDict,vm_status'
       */

      let data = callfn(indexDef.value, undefined, getter, prop)
      Promise.resolve(data).then(resp => {
        let list = resp
        if (resp.data != undefined) {
          list = resp.data
        }
        if (Array.isArray(map) && map.length > 0) {
          mapsCache.value[prop] = callfn(indexDef.value, list, map[0], prop)
        } else {
          mapsCache.value[prop] = list
        }
      })
    } else {
      return []
    }
  }

  return mapsCache.value[prop]
}

onMounted(() => {
  if (indexDef.value.maps) {
    Object.keys(indexDef.value.maps).forEach(prop => {
      loadMap(prop)
    })
  }
})

const emit = defineEmits([])


const columns = computed(() => {
  return indexDef.value?.props.filter(item => {
    return !item.exclude
  }).map(column => {
    const resolver = column.resolver || 'emptyn'
    if (column.customRender) {
      const render = column.customRender

      column.customRender = (data) => {
        return render(data, emit)
      }
    } else {
      if (column.dataType == 'datetime' && !column.resolver) {
        column.customRender = ({ text }) => fmtDatetime(text)
      } else if (column.dataType == 'toggle') {
        column.customRender = ({ text, record }) => {
          return h(Switch, {
            checked: text,
            onChange: (checked) => {
              request.post(replaceParams(toggleUrl, record)).then(() => {
                emit('toggle', record)
                refreshTable()
              })
            }
          })
        }
      } else if (column.dataType == 'map') {
        column.customRender = ({ text, record }) => {

          return h('span', {}, mapsCache.value[column.mapIndex || column.dataIndex]?.[text] || text)
        }
      } else {
        column.customRender = ({ text, record }) => {
          return callfn(record, text, resolver, column.dataIndex)
        }
      }
    }

    return column
  })
})

const queries = computed(() => {
  return indexDef.value.searchData
})

// 过滤列
const filterCols = computed(() => {
  return indexDef.value?.props.filter(item => item.filter || item.filterRender).map(item => {

    item.filterName = item.filterName || item.dataIndex

    item.mapIndex = item.mapIndex || item.dataIndex

    item.filterIf = item.filterIf || (() => true)
    const filterFn = useAsFunction(item.filterProps)

    var op = ''

    if (typeof item.filter === 'string') {
      const fparts = item.filter.split(':')

      if (fparts.length > 1) {
        op = fparts[1]
      }

      item.filter = fparts[0]
    }

    item.filterProps = (col) => {
      const res = Object.assign({
        op,
      }, filterFn(col) || {}, {
        isFilter: true,
        col: col,
        dataSource: mapArray.value[col.mapIndex]
      })

      return res
    }

    //console.log(item);
    return item
  })
})

// 表单列
const formCols = computed(() => {
  return indexDef.value.props.filter(item => item.form || item.formSlot).map(item => {

    item.formIf = item.formIf || (() => true)
    item.formName = item.formName || item.dataIndex
    item.mapIndex = item.mapIndex || item.dataIndex

    const formFn = useAsFunction(item.formProps)


    item.formProps = (col) => {
      const res = Object.assign({

      }, formFn(col) || {}, {
        col: col,
        dataSource: mapArray.value[col.mapIndex]
      })

      return res
    }


    return item
  })
})

const colSlots = computed(() => {
  return indexDef.value?.props.filter(item => item.slot).map(item => item.slot)
})

// 初始过滤条件
const initFilters = computed(() => {
  return indexDef.value?.props.filter(item => item.initFilter).reduce((res, item) => {
    const filter = useAsFunction(item.initFilter)()

    switch (item.filter) {
      case 'between':
        res[`${item.dataIndex},between`] = filter
        break;
      case 'select_map':
        res[`${item.dataIndex},match_phrase`] = filter
        break;
      default:
        res[item.dataIndex] = filter
    }
    return res
  }, props.filters || {})
})

const apiUrl = computed(() => {
  return indexDef.value.apiUrl
})

// 按钮
const buttons = computed(() => {
  const defBtns = (indexDef.value.buttons || [])
  if (indexDef.value.post) {
    return [
      {
        title: '新增',
        action: () => openModal(),
        icon: h(PlusCircleOutlined),
        disabled: () => props.addDisabled
      },
      ...defBtns
    ]
  }
  const exportBtn = indexDef.value.export

  return defBtns
})

const refreshTable = (data = {}) => {
  tableRef.value && tableRef.value.refresh(data)
}

// 操作列
const actions = computed(() => {
  const defActs = (indexDef.value.actions || [])
  const extra = []
  const post = indexDef.value.post
  const showActionTitle = indexDef.value.showActionTitle == undefined ? true : indexDef.value.showActionTitle
  if (post && !post.noEdit) {
    extra.push({
      title: showActionTitle ? '编辑' : '',
      action: (record) => {
        if (post.detailUrl) {
          request({
            url: replaceParams(post.detailUrl, record),
            method: 'get'
          }).then(({ data }) => openEdit(data))
        } else {
          openEdit(record)
        }
      },
      icon: h(EditOutlined),
      disabled: record => post.editDisabled ? post.editDisabled(record) : false
    })
  }

  const del = indexDef.value.delete
  if (del) {
    const confirm = del.confirm
    extra.push({
      title: showActionTitle ? '删除' : '',
      action: record => {
        const url = replaceParams(del.url, record)
        request({
          url,
          method: del.method || 'delete',
        }).then(() => {
          message.info('删除成功')
          refreshTable()
        })
      },
      danger: true,
      icon: h(DeleteOutlined),
      confirm: record => confirm ? confirm(record) : `确定删除 ${record}`,
      disabled: record => del.disabled ? del.disabled(record) : false
    })
  }

  return extra.concat(defActs)
})


defineExpose({
  refresh: refreshTable,
  resetFilters: () => tableRef.value && tableRef.value.resetFilters()
})
// console.log(getFormComponent('input'))
const slots = useSlots()
// console.log(slots)
</script>

<template>
  <Card v-if="!hasIndex(index)">
    未注册的面板索引：{{ index }}
  </Card>
  <Table v-else :action-width="indexDef.actionWidth" :init-filters="initFilters" :sort="indexDef.sort" :buttons="buttons"
    ref="tableRef" :columns="columns" :actions="actions" :search-data="queries" :api-url="apiUrl">
    <template #[item]="data" v-for="item in colSlots" :key="item">
      <slot :name="item" v-bind="data"></slot>
    </template>
    <template #[slot]="slotData" v-for="(fn, slot) in slots" :key="slot">
      <slot :name="slot" v-bind="slotData"></slot>
    </template>
    <ModalForm v-if="indexDef.post" ref="modalRef" :method="indexDef.post?.method || 'post'" @submitted="submitted"
      :width="indexDef.post?.modalWidth || '500px'" :title="modalTitle" v-model:open="modalOpen" :model="post"
      :api-url="indexDef.post?.url">
      <template v-for="col in formCols" :key="col.dataIndex">

        <FormItem :name="col.formName" :label="col.hideFormTitle ? undefined : col.formTitle || col.title"
          :rules="col.rules" :help="useAsFunction(col.formHelp)(post)" v-if="col.formIf(post)"
          :wrapperCol="col.formWrapperCol || undefined">
          <component v-if="hasFormComponent(col.form)"
            :is="renderFormComponent(col.form, post, col.formName, useAsFunction(col.formProps)(col))">
          </component>
          <template v-if="col.formSlot">
            <slot :name="col.formSlot" :post="post" :column="col"></slot>
          </template>
        </FormItem>
      </template>
    </ModalForm>

    <template #filters="{ filters }" v-if="filterCols.length > 0">
      <Col :span="indexDef.filterNoCol ? undefined : col.filterSpan || 6" v-for="col in filterCols"
        :key="col.filterName">
      <FormItem :label="col.filterTitle || col.title" :disabled="disabledFilters.indexOf(col.filterName) > -1"
        v-bind="col.filterFormProps || indexDef.filterFormProps">
        <component v-if="hasFilterComponent(col.filter)"
          :is="renderFilterComponent(col.filter, filters, col.filterName, useAsFunction(col.filterProps)(col))">
        </component>
        <template v-if="col.filterSlot">
          <slot :name="col.filterSlot" :filters="filters" :field="col.filterName" :column="col"></slot>
        </template>
        <component v-if="col.filterRender"
          :is="col.filterRender(filters, col, mapArray, disabledFilters.indexOf(col.filterName) > -1)"></component>
      </FormItem>
      </Col>
    </template>
  </Table>
</template>

<style lang="scss" scoped></style>