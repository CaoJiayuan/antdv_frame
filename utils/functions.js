import _ from 'lodash'


export function replaceParams(temp, data) {
  return temp.replace(/:\w+/g, function (key) {
    return _.get(data, key.replace(':', '').split('.'))
  })
}
