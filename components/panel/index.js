import { ref } from 'vue'
import { defineStore } from 'pinia'



export const usePanelStore = defineStore('panel', () => {
  const formComponents = ref({})

  const indices = ref({})

  const filterComponents = ref({})

  const cellRenders = ref({})

  function registerFormComponent(key, fn) {
    formComponents.value[key] = fn
  }

  function registerFilterComponent(key, fn) {
    filterComponents.value[key] = fn
  }

  function getFormComponent(key) {
    return formComponents.value[key]
  }

  function getFilterComponent(key) {
    return filterComponents.value[key]
  }

  function hasFormComponent(key) {
    return Object.keys(formComponents.value).indexOf(key) > -1
  }

  function hasFilterComponent(key) {
    return Object.keys(filterComponents.value).indexOf(key) > -1 || Object.keys(formComponents.value).indexOf(key) > -1
  }

  function withIndex(name, conf) {
    indices.value[name] = conf
  }

  function getIndex(name) {
    return indices.value[name]
  }

  function hasIndex(name) {
    return Object.keys(indices.value).indexOf(name) > -1
  }


  function hasCellRender(key) {
    return Object.keys(cellRenders.value).indexOf(key) > -1
  }

  function registerCellRender(key, fn) {
    cellRenders.value[key] = fn
  }

  function getCellRender(key) {
    return cellRenders.value[key]
  }

  return {
    formComponents,
    filterComponents,
    indices,
    registerFormComponent,
    registerFilterComponent,
    getFormComponent,
    getFilterComponent,
    hasFormComponent,
    hasFilterComponent,
    getIndex,
    hasIndex,
    withIndex,
    registerCellRender,
    getCellRender,
    hasCellRender
  }
})
