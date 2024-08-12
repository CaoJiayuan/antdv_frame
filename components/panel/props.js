import { ref } from 'vue'
import { defineStore } from 'pinia'

export const defaultAdapter = {
  query(indexDef, props) {
    return {
      url: indexDef.apiUrl,
      method: indexDef.method || 'POST',
      data: Object.assign({}, indexDef.searchData, props.searchData),
      after(res, indexProps) {

      }
    }
  },
  save(indexDef, props) {
    return {
      url: indexDef.post?.url,
      method: indexDef.post?.method || 'post',
      modalWidth: indexDef.post?.modalWidth || '500px',
      dataResolver: data => data,
      default: indexDef.post?.default || {}
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