
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRequestStore = defineStore('request', () => {
  const request = ref(null)

  function setRequest(req) {
    request.value = req
  }

  function getRequest() {
    return request.value
  }

  return {
    request,
    setRequest,
    getRequest
  }
})


export function useRequest(axios) {
  let rs = useRequestStore()

  if (!rs.getRequest()) {
    rs.setRequest(axios)
  }

  return rs.getRequest()
}


export function getRequest() {
  let rs = useRequestStore()
  return rs.getRequest()
}
