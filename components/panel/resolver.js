import _ from 'lodash'
import { fmtDatetime } from '../../utils/date.js'

import { functions } from 'nerio-js-utils'

const { useAsFunction } = functions

function echo(val) {
  return val
}

const resolvers = {
  join(val, s = ',') {
    if (!val) {
      return ''
    }
    try {
      return val.join(s)
    } catch (e) {
      return val
    }
  },
  echo,
  fmtdt: fmtDatetime,
  emptyn(val) {
    if (val == 'null') {
      return ''
    }
    return val
  },
  extact(val, key) {
    return _.get(val, key.split('.'))
  },
  mapkv(val, key, valkey) {
    return val.reduce((res, item) => {
      res[item[key]] = item[valkey]
      return res
    }, {})
  }
}


function extractValue(data, str, prop, ...args) {
  if (typeof str != 'string') {
    return str
  }

  if (str.indexOf('$') < 0) {
    return str
  }

  if (str == '$') {
    return _.get(data, prop)
  }

  if (_.startsWith(str, '$.')) {
    const key = _.trimStart(str, '$.')

    return _.get(_.get(data, prop), key)
  }

  if (_.startsWith(str, '$')) {
    const match = str.match(/\$(\d+)(.|$)(.*)/)
    if (match && match.length == 4) {
      const index = parseInt(match[1])
      if (args.length > index) {
        const val = args[index]
        if (match[3] != "") {
          return _.get(val, match[3])
        }

        return val
      }
    }


    const key2 = _.trimStart(str, '$')

    return _.get(data, key2)
  }

  let parts = []
  let len = 0
  for (let i in str) {
    const char = str[i]
    if (char == '$' || char == ' ') {
      len++
      if (parts[len] == undefined) {
        parts[len] = ''
      }

      parts[len] += char
    } else {
      if (parts[len] == undefined) {
        parts[len] = ''
      }

      parts[len] += char
    }
  }

  return echo(...parts.map(p => extractValue(data, p)))
}


function parseFnString(record, fnString, prop, ...args) {
  if (typeof fnString == 'function') {
    return [
      {
        fn: fnString,
        args: args
      }
    ]
  }

  if (typeof fnString != 'string') {
    return [
      {
        fn: echo,
        args: [fnString]
      }
    ]
  }

  const parts = fnString.split('|')

  return parts.map(part => {
    const fnDefine = part.split(':')

    const fn = resolvers[fnDefine[0]]

    if (!fn) {
      return {
        fn: echo,
        args: [`function string [${part}] parse error, invalid function ${fnDefine[0]}`]
      }
    }

    let args = []

    if (fnDefine.length > 1) {
      args = fnDefine[1].split(',').map(arg => {
        if (_.startsWith(arg, '$')) {
          return extractValue(record, arg, prop, ...args)
        }

        return arg
      })
    }

    return {
      fn,
      args
    }
  })
}


export function useResolver(mapRef) {

  function callfnMap(list, fnString, prop, ...args) {
    parseFnString(list, fnString, prop, ...args)
    return list.map(item => {
      return fns.reduce((res, def) => {
        let fnArgs = []
        if (res != undefined) {
          fnArgs.push(res)
        }
        fnArgs = fnArgs.concat(def.args)

        return def.fn.apply(null, fnArgs)
      }, item)
    })
  }

  function callfn(context, val, fnString, prop, ...args) {
    return parseFnString(context, fnString, prop, ...args).reduce((res, def) => {
      let fnArgs = []
      if (res != undefined) {
        fnArgs.push(res)
      }
      fnArgs = fnArgs.concat(def.args)

      return def.fn.apply(null, fnArgs)
    }, val)
  }

  function withResolver(name, fn) {
    resolvers[name] = useAsFunction(fn)
  }
  

  return { resolvers, parseFnString, callfn, callfnMap, withResolver}
}