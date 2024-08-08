
let request

export function useRequest(axios) {
  if (!request) {
    request = axios
  }

  return request
}


export function getRequest() {
  return request
}

export default request