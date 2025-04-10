
import { computed, h, ref, defineProps, defineEmits } from "vue"
import { functions } from 'nerio-js-utils'
const { useAsFunction } = functions
import _ from 'lodash'

import { usePanelStore } from "../index.js"

const coms = import.meta.globEager("./components/*.vue")


export function withDefaults() {
  const ps = usePanelStore()

  Object.keys(coms).forEach(key => {
    const name = key.replace(/^\.\//, '').replace(/\.vue$/, '').replace('components/', '')
    ps.registerFormComponent(name, (post, field, props, mutate) => {
      var modelValue
      if (Array.isArray(field)) {
        modelValue = _.get(post, field)
      } else {
        modelValue = post[field]
      }

      // console.log(props)
      return h(coms[key].default, Object.assign({}, props, {
        modelValue,
        'onUpdate:modelValue': v => {
          _.set(post, field, v)
          mutate(field, v, post)
        },
      }))
    })
  })
}

export function renderFormComponent(key, post, field, props, mutate) {

  const ps = usePanelStore()

  const fn = ps.getFormComponent(key)
  if (fn) {
    return fn(post, field, props, mutate)
  }

  return h('span', {}, '未注册组件：' + key)
}


export function renderFilterComponent(key, post, field, props) {
  const ps = usePanelStore()

  const fn = ps.getFilterComponent(key)
  if (props.op) {
    const strField = Array.isArray(field) ? field.join('.') : field
    field = `${strField},${props.op}`
  }

  if (fn) {

    return fn(post, props, field, props)
  }

  return renderFormComponent(key, post, field, props)
}


export function useForm(name, defaultPost = {}) {

  const modalOpen = ref(false)
  const post = ref(useAsFunction(defaultPost)())

  const tableRef = ref()
  const modalRef = ref()

  const modelFormConfig = ref({})

  let cancelModal = () => { }

  const openModal = (config = {}) => {
    modelFormConfig.value = config
    post.value = useAsFunction(defaultPost)()
    if (modalRef.value) {
      cancelModal = modalRef.value.openModal(config)
    }
  }

  const modalTitle = computed(() => {
    var pre = post.value.id ? '修改' : '新增'
    if (modelFormConfig.value?.detail) {
      pre = '查看'
    }

    return `${pre}${name}`
  })

  const refreshTable = () => {
    tableRef.value && tableRef.value.refresh()
  }

  function openEdit(record) {
    openModal()
    post.value = _.cloneDeep(record)
  }

  const submitted = () => {
    cancelModal()
    refreshTable()
  }

  function openShow(record) {
    openModal({
      detail: true,
    })
    post.value = _.cloneDeep(record)
  }

  return {modalOpen, modalRef, openModal, openEdit, modelFormConfig, openShow, submitted, modalTitle, post, tableRef}
}