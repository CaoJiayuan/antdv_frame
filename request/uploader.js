import { useRequestStore } from '.'
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

  const uploads = ref([])

  function getIconByExtention(extension) {
    let icon;
    if (knownFileTypes.indexOf(extension) > -1) {
      icon = fileIconsDir + extension + '.svg';
    } else {
      icon = fileIconsDir + 'file.svg';
    }
    return icon;
  }

  function isImageFile(filename) {
    let partials = filename.split('?')[0].split('.');

    let ext = partials[partials.length - 1];

    return imageExts.filter(e => {
      return e.toLowerCase() === ext.toLowerCase()
    }).length > 0
  }


  const { uploadDriver } = useRequestStore()

  function uploadFile(f, options = {}, fileHolder = null) {
    
    const currentFile = ref({
      progress: 0,
      error: false,
      errorMsg: '',
      done: false,
      uploading: false,
      valid: true,
      ts: new Date().getTime(),
      filename: f.name,
      type: f.type,
    })
    uploads.value.push(currentFile.value)
    //file.value = currentFile
    fileHolder && fileHolder(currentFile.value)
    const reqOptions = Object.assign({
      progress: percent => currentFile.value.progress = percent,
      url
    }, options)

    currentFile.value.valid = true

    let uploadFile = new UploadFile(f);

    if (uploadFile.isImage()) { // image preview has issues with mockjs
      let reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onloadend = e => {
        currentFile.value.preview = e.target.result;
      };
    } else {
      let extension = uploadFile.getExtension();
      let icon = getIconByExtention(extension);
      currentFile.value.preview = icon;
    }
    currentFile.value.uploading = true
    return upload(f, uploadDriver, reqOptions).then(data => {
      let url = data.url
      currentFile.value.url = url;
      currentFile.value.path = data.path
      currentFile.value.progress = 100;
      currentFile.value.done = true;
      currentFile.value.uploading = false;
      currentFile.value.error = false;
      currentFile.value.errorMsg = '';
      currentFile.value.preview = url
      return currentFile.value
    }).catch(error => {
      currentFile.value.error = true;
      currentFile.value.errorMsg = error.message;
      currentFile.value.uploading = false;
      return currentFile.value
    });
  }


  return { uploads, uploadFile, isImageFile, getIconByExtention }
}