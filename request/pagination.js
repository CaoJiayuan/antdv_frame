import { computed, ref } from "vue"
import { getRequest } from "."

export function usePagination(emit, method = 'post') {
  const loading = ref(false)
  const loaded = ref(false)
  const finished = ref(false)

  const data = ref([])

  const meta = ref({})

  const request = getRequest()

  const cachePerPage = ref(15)
  const withoutPage = ref(false)
  const latency = ref(0)
  const cacheFilters = ref({})

  function paginate(apiUrl, { perPage = cachePerPage.value, page = 1, sort, filters = cacheFilters.value, search, extra = {} }, append = false) {
    loading.value = true
    loaded.value = false
    cachePerPage.value = perPage
    const start = new Date().getTime()
    cacheFilters.value = filters
    const reqData = {
      url: apiUrl,
      method,
      data: Object.assign({}, extra, {
        per_page: perPage, page, sort, filters, search
      })
    }

    return request(reqData).then((res) => {
      latency.value = new Date().getTime() - start
      const isList = Array.isArray(res.data) 
      const items =isList ? res.data : res.data.data

      for (let i in items) {
        items[i].key = parseInt((page - 1) * perPage) + parseInt(i)
      }

      if (append) {
        data.value = data.value.concat(items)
      } else {
        data.value = items
      }
      loading.value = false
      loaded.value = true
      if (res.data.meta) {
        meta.value = res.data.meta
      }
      if (isList) {
        withoutPage.value = true
        finished.value = true
      } else {
        withoutPage.value = res.data.meta == undefined
        finished.value = meta.value.last_page == meta.value.page || meta.value.last_page == 0;
      }
   
      emit('loaded', res, reqData)
      return res
    }).catch(() => {
      latency.value = new Date().getTime() - start
      loaded.value = false
      loading.value = false
      finished.value = true
    })
  }


  return { paginate, loaded, loading, meta, data, finished, withoutPage, latency }
}