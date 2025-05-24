<script setup>
import Table from '../table/Index.vue'
import { getRequest } from '../../request'
const request = getRequest()

import { FormItem, Col, Row, message, Switch, Card } from 'ant-design-vue'
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue'
import ModalForm from '../form/ModalForm.vue'
import { computed, h, nextTick, onMounted, ref, useAttrs, useSlots } from 'vue'
import { fmtDatetime } from '../../utils/date.js'
import { replaceParams } from '../../utils/functions.js'
import { functions } from 'nerio-js-utils'
import { useResolver } from './resolver'
const { useAsFunction } = functions
import _ from 'lodash'
import { usePanelAdapterStore } from './props.js'
import { useForm, renderFormComponent, renderFilterComponent } from './form'
import { usePanelStore } from "./index.js"


const { hasFormComponent, hasFilterComponent, getIndex, hasIndex, hasCellRender, getCellRender } = usePanelStore()

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
  searchData: {
    type: Object,
    default: () => ({})
  },
  addDisabled: {
    type: Boolean,
  },
  disabledFilters: {
    type: Array,
    default: () => []
  },
  debug: Boolean
})
const indexFn = getIndex(props.index)

// const indexDef = ref(indexFn() || {})

const indexDef = computed(() => {
  if (!indexFn) {
    return {}
  }

  const def = indexFn(props) || {}
  if (def.filterNoCol === undefined) {
    def.filterNoCol = true
  }
  return def
})

const propsState = ref(indexDef.value?.props || [])
const adapterState = ref({})
const renderTime = ref(0)

const config = computed(() => {
  const adapter = usePanelAdapterStore().getAdapter(indexDef.value?.adapter || 'default')

  return {
    query: adapter.query(indexDef.value, props, adapterState.value),
    save: adapter.save(indexDef.value, props, adapterState.value),
    delete: adapter.delete(indexDef.value, props, adapterState.value),
    toggle: adapter.toggle(indexDef.value, props, adapterState.value),
  }
})

const toggleUrl = computed(() => {
  return indexDef.value.toggleUrl || `/${indexDef.value.apiUrl}/toggle/:id`
})

const { modalOpen, modalRef, openModal, openShow, openEdit, submitted, modelFormConfig, modalTitle, post, tableRef } = useForm(indexDef.value?.post?.name, () => {
  const postData = _.clone(props.postData)


  return Object.assign({}, postData, _.clone(useAsFunction(config.value.save.default)()))
})

const quilifiedModelTitle = computed(() => {
  let title = config.value.save?.title

  if (title) {
    return useAsFunction(title)(post.value, modelFormConfig.value)
  }

  return modalTitle.value
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
    const mt = indexDef.value.mapsType || {}
    let isString = mt[key] == 'string'

    const map = mapsCache.value[key]
    if (map) {
      res[key] = []
      for (let k in map) {
        res[key].push({
          value: (isString || isNaN(k) || k.length > 16) ? k : parseInt(k),
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

const emit = defineEmits(['loaded', 'toggle', 'beforeEdit', 'beforeDelete', 'beforeShow', 'beforeSave', 'mutated', 'submitted'])
const attrs = useAttrs()

const mutateCallback = (key, value, post) => {
  emit('mutated', key, value, post)
}

const formSubmitted = (post) => {
  submitted()
  emit('submitted', post)
}

function onLoaded(res, req) {
  emit('loaded', res, req)
  const conf = config.value
  conf.query?.after && conf.query?.after(res, propsState)
}


const columns = computed(() => {
  renderTime.value++
  return propsState.value.filter(item => {
    return !item.exclude
  }).map(column => {
    const resolver = column.resolver || 'emptyn'
    const col = _.clone(column)

    if (col.customRender) {
      const render = column.customRender
      col.customRender = (data) => {
        return render(data, emit, _.clone(col.props) || {})
      }
    } else {
      const toggle = config.value.toggle || {}

      if (column.dataType == 'datetime' && !column.resolver) {
        col.customRender = ({ text }) => fmtDatetime(text)
      } else if (column.dataType == 'date' && !column.resolver) {
        col.customRender = ({ text }) => fmtDatetime(text, 'YYYY-MM-DD')
      } else if (column.dataType == 'toggle' && toggle.url) {
        col.customRender = ({ text, record }) => {
          return h(Switch, {
            checked: toggle.valueResover ? toggle.valueResover(text, record, col) : text,
            onChange: (checked) => {
              request.post(replaceParams(toggle.url, record), toggle.dataResolver ? toggle.dataResolver(checked, record, col) : {}).then(() => {
                emit('toggle', record)
                refreshTable()
              })
            },
            disabled: toggle.disabled ? useAsFunction(toggle.disabled)(record, col) : false
          })
        }
      } else if (column.dataType == 'map') {
        col.customRender = ({ text, record }) => {
          return h('span', {}, mapsCache.value[column.mapIndex || column.dataIndex]?.[text] || text)
        }
      } else {
        if (hasCellRender(column.dataType)) {
          const fn = getCellRender(column.dataType)
          const props = Object.assign({}, useAsFunction(col.props)(col, mapsCache.value), {
            maps: mapsCache.value
          })

          col.customRender = ({ text, record }) => {
            const txt = callfn(record, text, resolver, column.dataIndex)
            return fn({
              text: txt,
              record,
              column: col,
            }, emit, props)
          }
        } else {
          col.customRender = ({ text, record }) => {
            return callfn(record, text, resolver, column.dataIndex)
          }
        }
      }
    }
    return col
  })
})

// 过滤列
const filterCols = computed(() => {
  return propsState.value.filter(item => item.filter || item.filterRender).map(itemProp => {

    const item = _.clone(itemProp)

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
  return propsState.value.filter(item => item.form || item.formSlot).map(itemProp => {
    const item = _.clone(itemProp)
    item.formIf = item.formIf || (() => true)
    const fname = item.formName || item.dataIndex
    item.formName = fname.split('.')

    item.mapIndex = item.mapIndex || item.dataIndex

    const formFn = useAsFunction(item.formProps)

    item.formProps = (col, post) => {
      const append = {
        col: col,
        dataSource: mapArray.value[col.mapIndex],
      }

      const detail = modelFormConfig.value?.detail
      if (detail != undefined) {
        append.detail = detail
      }

      const res = Object.assign({}, formFn(col, post) || {}, append)

      return res
    }


    return item
  })
})

const colSlots = computed(() => {
  return propsState.value.filter(item => item.slot).map(item => item.slot)
})

// 初始过滤条件
const initFilters = computed(() => {
  return propsState.value.filter(item => item.initFilter).reduce((res, item) => {
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

// 按钮
const buttons = computed(() => {
  const defBtns = _.clone(indexDef.value.buttons || [])
  const save = config.value.save

  if (save.url && !save.noAdd) {
    return [
      {
        title: save.addTitle || '新增',
        action: () => {
          if (attrs.onAdd) {
            attrs.onAdd(post.value)
          } else {
            openModal()

            nextTick(() => {
              emit('beforeSave', {}, post.value)
            })
          }
        },
        icon: h(PlusCircleOutlined),
        disabled: () => save.disabled
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

const showDetail = computed(() => {
  const query = config.value.query

  return query.url && !query.noDetail
})
// 操作列
const actions = computed(() => {
  const defActs = (indexDef.value.actions || [])
  const extra = []
  const save = config.value.save
  const showActionTitle = indexDef.value.showActionTitle == undefined ? true : indexDef.value.showActionTitle
  const query = config.value.query

  const loadDetail = (record) => {
    return request({
      url: replaceParams(query.detailUrl, record),
      method: query.detailMethod || 'post',
      data: query.detailDataResolver ? query.detailDataResolver(record) : {}
    }).then(({ data }) => data)
  }

  if (query.detailUrl && !query.noDetail) {
    extra.push({
      title: query.detailTitle || '详情',
      action: (record) => {
        if (query.detailUrl) {
          loadDetail(record).then(data => {
            if (attrs.onDetail) {
              attrs.onDetail(data)
              return
            }
            emit('beforeShow', record, data)
            openShow(data)

          })
        } else {
          if (attrs.onDetail) {
            attrs.onDetail(record)
            return
          }
          emit('beforeShow', record, record)
          openShow(record)
        }
      },
      icon: h(EyeOutlined),
      disabled: record => query.detailDisabled ? useAsFunction(save.detailDisabled)(record) : false,
      show: record => query.showDetail ? useAsFunction(query.showDetail)(record) : true
    })
  }

  if (save.url && !save.noEdit) {
    extra.push({
      title: showActionTitle ? '编辑' : '',
      action: (record) => {
        if (query.detailUrl) {
          loadDetail(record).then(data => {
            if (attrs.onEdit) {
              attrs.onEdit(data)
              return
            }
            emit('beforeEdit', data)
            openEdit(data)
            nextTick(() => {
              emit('beforeSave', {}, post.value)
            })
          })
        } else {
          if (attrs.onEdit) {
            attrs.onEdit(record)
            return
          }
          emit('beforeEdit', record)
          openEdit(record)
          nextTick(() => {
            emit('beforeSave', {}, post.value)
          })
        }
      },
      icon: h(EditOutlined),
      disabled: record => save.editDisabled ? useAsFunction(save.editDisabled)(record) : false,
      show: record => save.showEdit ? useAsFunction(save.showEdit)(record) : true
    })
  }


  const del = config.value.delete
  if (del.url) {
    const confirm = del.confirm
    extra.push({
      title: showActionTitle ? '删除' : '',
      action: record => {
        const url = replaceParams(del.url, record)
        emit('beforeDelete', record)
        request({
          url,
          method: del.method || 'delete',
          data: del.dataResolver ? del.dataResolver(record) : {}
        }).then(() => {
          message.info('删除成功')
          refreshTable()
        })
      },
      danger: true,
      icon: h(DeleteOutlined),
      confirm: record => confirm ? useAsFunction(confirm)(record) : `确定删除 ${record}`,
      disabled: record => del.disabled ? useAsFunction(del.disabled)(record) : false,
      show: record => del.show ? useAsFunction(del.show)(record) : true
    })
  }

  return extra.concat(defActs)
})


defineExpose({
  refresh: refreshTable,
  resetFilters: () => tableRef.value && tableRef.value.resetFilters(),
  setPost: setter => {
    setter && setter(post)
  },
  openEdit,
  openShow,
  openModal,
  getForm: cb => {
    modalRef.value && modalRef.value.getForm(cb)
  }
})
// console.log(getFormComponent('input'))
const slots = useSlots()
// console.log(slots)

</script>

<template>
  <Card v-if="!hasIndex(index)">
    未注册的面板索引：{{ index }}
  </Card>
  <Table v-else :action-width="indexDef.actionWidth" :init-filters="initFilters" :sort="indexDef.sort"
    :buttons="buttons" ref="tableRef" :columns="columns" :actions="actions" :search-data="config.query.data"
    :api-url="config.query.url" @loaded="onLoaded" :filter-label-col="config.query.filterLabelCol"
    :filter-wrapper-col="config.query.filterWrapperCol" v-bind="attrs">
    <div v-if="debug" class="mt-2">
      <pre>
render time: {{ renderTime }}
________________________
maps:
{{ mapsCache }}
------
{{ mapArray }}
________________________
config:
{{ config }}
</pre>
    </div>
    <template #[item]="data" v-for="item in colSlots" :key="item">
      <slot :name="item" v-bind="data"></slot>
    </template>
    <template #[slot]="slotData" v-for="(fn, slot) in slots" :key="slot">
      <slot :name="slot" v-bind="slotData"></slot>
    </template>
    <ModalForm v-if="config.save.url || showDetail" ref="modalRef" :method="config.save?.method || 'post'"
      @submitted="formSubmitted" :width="config.save.modalWidth || '500px'" :title="quilifiedModelTitle"
      v-model:open="modalOpen" :model="post" :api-url="config.save.url" :data-resolver="config.save.dataResolver"
      :label-col="config.save.labelCol" :wrapper-col="config.save.wrapperCol">
      <Row :gutter="[12, 0]">
        <template v-for="col in formCols" :key="col.dataIndex">
          <Col v-bind="col.formCol || config.save.col || { span: 24 }" v-if="col.formIf(post, modelFormConfig)">
          <FormItem :name="col.formName" :label="col.hideFormTitle ? undefined : col.formTitle || col.title"
            :rules="col.rules" :help="useAsFunction(col.formHelp)(post)" :wrapperCol="col.formWrapperCol || undefined"
            :label-col="col.formLabelCol || undefined">
            <template v-if="col.formSlot">
              <slot :name="col.formSlot" :post="post" :column="col" :detail="modelFormConfig.detail"
                :mutate="mutateCallback"></slot>
            </template>
            <component v-else-if="hasFormComponent(col.form)"
              :is="renderFormComponent(col.form, post, col.formName, useAsFunction(col.formProps)(col, post), mutateCallback)">
            </component>
          </FormItem>
          </Col>
        </template>
      </Row>
    </ModalForm>

    <template #filters="{ filters }" v-if="filterCols.length > 0">
      <template v-for="col in filterCols">
        <Col :span="indexDef.filterNoCol ? undefined : col.filterSpan || 6" :key="col.filterName" v-bind="col.filterCol"
          v-if="col.filterIf(filters, props)">
        <FormItem :label="col.filterTitle || col.title" :disabled="disabledFilters.indexOf(col.filterName) > -1"
          v-bind="col.filterFormProps || indexDef.filterFormProps" :label-col="col.filterLabelCol"
          :wrapper-col="col.filterWrapperCol">
          <template v-if="col.filterSlot">
            <slot :name="col.filterSlot" :filters="filters" :field="col.filterName" :column="col"></slot>
          </template>
          <component v-else-if="col.filterRender"
            :is="col.filterRender(filters, col, mapArray, disabledFilters.indexOf(col.filterName) > -1)"></component>
          <component v-else-if="hasFilterComponent(col.filter)"
            :is="renderFilterComponent(col.filter, filters, col.filterName, useAsFunction(col.filterProps)(col))">
          </component>
        </FormItem>
        </Col>
      </template>
    </template>
  </Table>
</template>

<style lang="scss" scoped></style>