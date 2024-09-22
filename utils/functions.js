import _ from 'lodash'

import { functions } from 'nerio-js-utils'
const { useAsFunction } = functions

export function replaceParams(temp, data) {
  return temp.replace(/:\w+/g, function (key) {
    return _.get(data, key.replace(':', '').split('.'))
  })
}


export function waitingFor(fn, timeout = 5) {
  fn = useAsFunction(fn)
  let interval
  let i = 100;
  let j = 0


  return new Promise((resolve, reject) => {
    let result = fn();
    if (result) {
      resolve(result)
    } else {
      interval = setInterval(() => {
        let result = fn();
        if (result) {
          resolve(result)
          clearInterval(interval)
        } else if ((timeout * 1000 / i) < j){
          clearInterval(interval)
          reject('waiting timeout')
        }
        j++;
      }, i)
    }
  })
}