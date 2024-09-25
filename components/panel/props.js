import { ref } from 'vue'
import { defineStore } from 'pinia'

export const defaultAdapter = {
  query(indexDef, props, state) {
    return {
      url: indexDef.apiUrl,
      method: indexDef.method || 'POST',
      data: Object.assign({}, indexDef.searchData, props.searchData),
      detailUrl: indexDef.detailUrl,
      after(res, indexProps) {

      },
      filterLabelCol: indexDef.filterLabelCol,
      filterWrapperCol: indexDef.filterWrapperCol,
      noDetail: indexDef.noDetail
    }
  },
  save(indexDef, props, state) {
    return {
      url: indexDef.post?.url,
      method: indexDef.post?.method || 'post',
      modalWidth: indexDef.post?.modalWidth || '500px',
      dataResolver: data => data,
      default: indexDef.post?.default || {},
      noEdit: indexDef.post?.noEdit,
      editDisabled: indexDef.post?.editDisabled,
      labelCol: indexDef.post?.labelCol,
      wrapperCol: indexDef.post?.wrapperCol,
      title: indexDef.post?.title
    }
  },
  delete(indexDef, props, state) {
    return {
      url: indexDef.delete?.url,
      method: indexDef.delete?.method || 'delete',
      dataResolver: data => ({}),
      confirm: indexDef.delete?.confirm,
      disabled: indexDef.delete?.disabled
    }
  },
  toggle(indexDef, props, state) {
    return {
      url: indexDef.toggleUrl,
      valueResover: value => value,
      dataResolver: (checked, record) => ({}),
      disabled: indexDef.toggle?.disabled
    }
  }
}


export const usePanelAdapterStore = defineStore('panelAdapter', () => {
  const adapters = ref({
    default: defaultAdapter
  })

  function registerAdapter(name, adapter) {
    adapters.value[name] = Object.assign({}, defaultAdapter, adapter)
  }


  function getAdapter(name) {
    return adapters.value[name] || defaultAdapter
  }

  return {
    adapters,
    registerAdapter,
    getAdapter
  }
})