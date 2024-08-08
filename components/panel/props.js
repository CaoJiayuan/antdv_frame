const indices = import.meta.globEager("./indices/*.js")

export function getIndices() {

  return Object.keys(indices).reduce((res, key) => {
    const name = key.replace(/^\.\/(.*)\.\w+$/, '$1');
    const parts = name.split('/')
    res[parts[parts.length - 1]] = indices[key].default
    return res
  }, {})
}


export default getIndices()