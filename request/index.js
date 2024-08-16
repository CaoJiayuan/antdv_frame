
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRequestStore = defineStore('request', () => {
  const request = ref(null)
  const uploadDriver = ref('server')

  function setRequest(req) {
    request.value = req
  }

  function getRequest() {
    return request.value
  }

  function withUploadDriver(driver) {
    uploadDriver.value = driver
  }

  return {
    request,
    uploadDriver,
    setRequest,
    getRequest,
    withUploadDriver
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


export function withUploadDriver(driver) {
  let rs = useRequestStore()
  rs.withUploadDriver(driver)
}
