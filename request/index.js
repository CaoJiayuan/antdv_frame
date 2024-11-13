
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRequestStore = defineStore('request', () => {
  const request = ref(null)
  const uploadDriver = ref('server')
  const extendFileTypeIcons = ref([])

  function setRequest(req) {
    request.value = req
  }

  function getRequest() {
    return request.value
  }

  function withUploadDriver(driver) {
    uploadDriver.value = driver
  }

  function withFileTypeIcons(...icons) {
    extendFileTypeIcons.value.push(...icons)
  }

  return {
    request,
    uploadDriver,
    setRequest,
    getRequest,
    withUploadDriver,
    extendFileTypeIcons,
    withFileTypeIcons
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
