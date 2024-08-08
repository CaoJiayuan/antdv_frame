import {AxiosPromise} from 'axios'

export type Method =
  | 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK'

declare interface RequestOptions {
  url?: string;
  method?: Method;
  data?: any;
  params?: any;
}

declare const request: (config: RequestOptions) => AxiosPromise;

export default request
