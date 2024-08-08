import { upload, UploadFile } from '../nerio-uploader'
import { ref } from 'vue'

const knownFileTypes = [
  'aep',
  'ai',
  'audition',
  'avi',
  'bridge',
  'css',
  'csv',
  'dbf',
  'doc',
  'docx',
  'dreamweaver',
  'dwg',
  'exe',
  'file',
  'fireworks',
  'fla',
  'flash',
  'html',
  'illustrator',
  'indesign',
  'iso',
  'javascript',
  'jpg',
  'jpeg',
  'json-file',
  'mp3',
  'mp4',
  'pdf',
  'photoshop',
  'png',
  'ppt',
  'prelude',
  'premiere',
  'psd',
  'rtf',
  'search',
  'svg',
  'txt',
  'xls',
  'xlsx',
  'xml',
  'zip-1',
  'zip',
  'ppt',
  'pptx'
]
const fileIconsDir = '/images/filetypes/'
const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp']

export function useUploader(url) {

  const file = ref({
    progress: 0,
    url: null,
    error: false,
    errorMsg: '',
    done: false,
    uploading: false,
    valid: true,
  })

  function getIconByExtention(extension) {
    let icon;
    if (knownFileTypes.indexOf(extension) > -1) {
      icon = fileIconsDir + extension + '.svg';
    } else {
      icon = fileIconsDir + 'file.svg';
    }
    return icon;
  }

  function reset() {
    file.value = {
      progress: 0,
      url: null,
      error: false,
      errorMsg: '',
      done: false,
      uploading: false,
      valid: false,
    }
  }

  function isImageFile(filename) {
    let partials = filename.split('.');

    let ext = partials[partials.length - 1];

    return imageExts.filter(e => {
      return e.toLowerCase() === ext.toLowerCase()
    }).length > 0
  }

  function setFileFromUrl(url) {
    if (!url) {
      reset()
      return
    }
    let partials = url.split(".");
    let ext = partials[partials.length - 1];
    let type = "file";
    if (["png", "jpg", "gif"].indexOf(ext) >= 0) {
      type = "image/" + ext;
    }

    file.value = {
      progress: 0,
      url: url,
      error: false,
      errorMsg: '',
      done: true,
      uploading: false,
      valid: false,
      preview: isImageFile(url) ? url : getIconByExtention(ext),
    }
  }

  const uploadDriver = ref('server')

  function withUploadDriver(driver) {
    uploadDriver.value = driver
  }

  function uploadFile(f, options = {}) {
    const reqOptions = Object.assign({
      progress: percent => file.value.progress = percent,
      url
    }, options)

    file.value.valid = true

    let uploadFile = new UploadFile(f);

    if (uploadFile.isImage()) { // image preview has issues with mockjs
      let reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onloadend = e => {
        file.value.preview = e.target.result;
      };
    } else {
      let extension = uploadFile.getExtension();
      let icon = getIconByExtention(extension);
      file.value.preview = icon;
    }
    file.value.uploading = true
    return upload(f, uploadDriver.value, reqOptions).then(data => {
      let url = data.url.split('?', 2)[0]
      file.value.url = url;
      file.value.path = data.path
      file.value.progress = 100;
      file.value.done = true;
      file.value.uploading = false;
      file.value.error = false;
      file.value.errorMsg = '';
      file.value.preview = url
      return file.value
    }).catch(error => {
      file.value.error = true;
      file.value.errorMsg = error.message;
      return file
    });
  }


  return { uploadFile, file, reset ,setFileFromUrl, withUploadDriver}
}