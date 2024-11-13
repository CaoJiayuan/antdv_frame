import UploadFile from './file'
import oss from './lib/drivers/oss'
import server from './lib/drivers/server'
import { mergeConfig } from './lib/default_options'

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUploaderStore = defineStore('uploader', () => {
  const drivers = ref({
    oss,
    server
  })

  function registerDriver(name, driver) {
    drivers.value[name] = driver
  }

  function hasDriver(name) {
    return Object.keys(drivers.value).indexOf(name) > -1
  }

  function getDriver(name) {
    return drivers.value[name]
  }

  return {
    drivers,
    registerDriver,
    hasDriver,
    getDriver
  }
})

function registerDriver(name, driver) {
  const store = useUploaderStore()

  store.registerDriver(name, driver)
}

function upload(file, driver, options) {
  const {hasDriver, getDriver} = useUploaderStore()

  if (!hasDriver(driver)) {
    return Promise.reject({
      message: `unregistered driver [${driver}]`
    })
  }

  let config = mergeConfig(options)
  const uploadFile = new UploadFile(file);
  let valid = config.validate(uploadFile);
  if (valid === true) {
    return getDriver(driver).upload(uploadFile, config)
  } else {
    return Promise.reject({
      code: 422,
      message: typeof valid === 'string' ? valid : uploadFile.invalidFileMessage
    })
  }

}

export {
  upload,
  UploadFile,
  registerDriver
}
