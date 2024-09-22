import md5 from 'blueimp-md5';
import { getRequest } from '../../../request'

function getOssClient(stsUrl, storageKey) {
  const axios = getRequest();
  let credentials = localStorage.getItem(storageKey);

  if (credentials) {
    credentials = JSON.parse(credentials);
  }

  if (credentials && credentials.expire_at * 1000 > new Date().getTime()) {
    let client = new OSS(credentials);
    client.prefix = credentials.prefix;
    return Promise.resolve(client)
  } else {
    return axios.get(stsUrl).then(re => {
      credentials = re.data;
      localStorage.setItem(storageKey, JSON.stringify(credentials));
      let client = new OSS(credentials);

      client.prefix = credentials.prefix;

      return client;
    })
  }
};

export default {

  /**
   *
   * @param {UploadFile} uploadFile
   * @param options
   */
  upload(uploadFile, options = {}) {
    let progress = options.progress;
    let file = uploadFile.file;
    let fixedProgress = p => {
      progress(Math.round(p * 100));
      // return done => {
      //   done();
      // }
    };
    return getOssClient(options.stsUrl, options.ossStorageKey).then(client => {
      let fileId = md5(file.name + new Date().getTime());
      let prefix = client.prefix ? client.prefix + '/' : '';
      let filename = fileId + '.' + uploadFile.getExtension();
      let path = prefix + filename;
      return client.multipartUpload(path, file, {
        progress: fixedProgress
      }).then(result => {
        let url = result.res.requestUrls[0].replace('http://', 'https://');

        return Promise.resolve({
          filename: file.name,
          type: file.type,
          url: url.split('?', 2)[0],
          path: path
        })
      })
    });
  }
}
