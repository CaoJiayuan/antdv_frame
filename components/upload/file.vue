<script setup>
import { PlusCircleOutlined, CloseCircleFilled } from '@ant-design/icons-vue';
import { computed, onMounted, ref, unref, } from 'vue';
import { useUploader } from '../../request/uploader.js'
import _ from 'lodash'
import { Progress, Image, Modal } from 'ant-design-vue'

import Video from '../Video.vue';
import { attachTypeApi } from 'ant-design-vue/es/message';
const widthMap = {
  small: 32,
  middle: 64
}

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  size: String,
  url: {
    type: String,
    default: () => 'upload'
  },
  dataResolver: {
    type: Function,
    default: (data) => {
      return {
        url: data.url,
        filename: data.filename,
        type: data.type,
        ts: data.ts
      }
    }
  },
  modelValue: {
    type: [Array, String],
    default: () => []
  },
  maxFiles: {
    type: Number,
    default: 6
  },
  accept: String,
  validator: {
    type: Function,
  },
  urlPrefix: {
    type: String,
    default: ''
  },
  readonly: Boolean,
  previewWidth: {
    type: String,
    default: "660px"
  }
})

const isSingle = computed(() => {
  return !Array.isArray(props.modelValue)
})

const previewOpen = ref(false)
const currentPreviewFile = ref({})

const inputRef = ref()

const { uploads, uploadFile, isImageFile, getIconByExtention } = useUploader(props.url)

const files = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

const previewFiles = computed(() => {
  if (isSingle.value) {
    var f = []
    if (files.value) {
      f.push({
        url: files.value
      })
    }

    return f.concat(uploads.value)
  }

  const fs = _.clone(files.value)

  return fs.concat(uploads.value)
})

function getUploadValidator() {
  if (props.validator) {
    return props.validator;
  }

  if (props.accept && props.accept !== '*/*') {
    return uploadFile => {
      let parts = props.accept.split(',');
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i].trim();
        if (part.startsWith('.')) {
          if (uploadFile.getExtension() == part.replace('.', '')) {
            return true
          }
        }

        let reg = new RegExp(part.replace('*', '.*'));
        if (reg.test(uploadFile.file.type)) {
          return true
        }
      }

      false
    };
  }

  return uploadFile => true;
}

function upload(e) {
  uploadFile(e.target.files[0], {
    validate: getUploadValidator()
  }).then((currentFile) => {
    const idx = uploads.value.indexOf(currentFile)
    if (currentFile.error) {
      uploads.value.splice(idx, 1)
      return
    }

    //const fileRes = props.dataResolver(data)
    if (idx > -1) {
      uploads.value.splice(idx, 1)
      if (isSingle.value) {
        files.value = currentFile.url
      } else {
        files.value.push(props.dataResolver(currentFile))
      }
    }
    resetFile()
  })
}

function triggerUpload() {
  inputRef.value.click()
}

function resetFile() {
  //reset()
  inputRef.value && (inputRef.value.value = '')
  //files.value = []
}
function removeFile(idx) {
  if (isSingle.value) {
    files.value = null
    return
  }

  if (files.value.length > idx) {
    files.value.splice(idx, 1)
  } else {
    uploads.value.splice(idx - files.value.length, 1)
  }
}

const s = computed(() => widthMap[props.size || 'middle'])

const btnSize = computed(() => `${s.value}px`)
const previewSize = computed(() => `${s.value - 4}px`)
onMounted(() => {
  //setFileFromUrl(unref(value))
})


function qualifyUrl(url) {
  if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0) {
    return url
  }

  return props.urlPrefix + url
}

function getPreview(file) {
  // console.log(file)

  if (file.preview) {
    return file.preview
  }

  if (file.url) {
    const isImage = file.type ? file.type.indexOf('image/') == 0 : false

    if (isImageFile(file.url) || isImage) {
      return qualifyUrl(file.url)
    }

    let partials = file.url.split('?')[0].split('.');
    let ext = partials[partials.length - 1];
    return getIconByExtention(ext)
  }

  return null
}


function isImage(file) {

  if (file.url) {
    const isImage = file.type ? file.type.indexOf('image/') == 0 : false
    return isImage || isImageFile(file.url)
  }

  return false
}

function isVideo(file) {

  if (file.url) {
    let partials = file.url.split('?')[0].split('.');

    let ext = partials[partials.length - 1];
    if (['mp4', 'webm', 'ogg', 'ogv', 'mov', 'mkv', 'flv', 'avi', 'wmv', 'rmvb', 'rm'].indexOf(ext) > -1) {
      return true
    }
  }

  return false
}

function openNew(file) {
  if (!file.url) {
    return
  }


  const a = document.createElement('a')
  a.target = '_blank'
  a.href = qualifyUrl(file.url)
  a.click()
}

function previewFile(file) {
  if (!isImage(file)) {

    if (isVideo(file)) {
      currentPreviewFile.value = file
      previewOpen.value = true
    } else {
      openNew(file)
    }
  }
}

</script>
<template>
  <div class="upload-wrapper">
    <div class="upload-file" v-for="(file, index) in previewFiles" :key="index">
      <div class="upload-preview cursor-pointer" @click="previewFile(file)" title="点击预览">
        <CloseCircleFilled v-if="file.error" class="text-red-800 text-xl" />
        <Image :src="getPreview(file)" :preview="isImage(file)"
          :style="{ maxWidth: previewSize, maxHeight: previewSize }" v-else />

      </div>
      <Progress type="circle" :size="s - 6" :percent="file.progress" v-if="file.uploading" />

      <a @click="removeFile(index)" v-if="!readonly && !file.uploading" class="upload-remove">移除</a>
    </div>
    <div class="upload-btn"
      v-if="!readonly && previewFiles.length < maxFiles && (!isSingle || previewFiles.length == 0)">
      <PlusCircleOutlined @click="triggerUpload" />
    </div>

    <input ref="inputRef" type="file" style="display: none" @change="upload" :accept="accept">
    <Modal v-model:open="previewOpen" title="预览" :footer="null" :width="previewWidth" class="uploader-preview">
      <Video :src="currentPreviewFile.url" v-if="isVideo(currentPreviewFile)"></Video>
    </Modal>
  </div>
</template>
<style lang="scss" scoped>


.upload-wrapper {
  position: relative;
  display: flex;
  gap: 4px;


  .upload-file {
    position: relative;
    border: 1px dotted #b9b9b9;
    border-radius: 8px;
    overflow: hidden;
    width: v-bind(btnSize);
    height: v-bind(btnSize);
    display: flex;
    justify-content: center;
    align-items: center;

    .ant-progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.253);
      backdrop-filter: blur(2px);
      color: white;

      .ant-progress-text {
        color: white;
      }
    }

    .upload-remove {
      position: absolute;
      left: 0;
      bottom: 0;
      font-size: 12px;
      background: rgba(255, 0, 0, 0.418);
      width: 100%;
      color: white;
      text-align: center;
      display: none;
    }

    &:hover {
      .upload-remove {
        display: block;
      }
    }
  }

  .upload-btn {
    position: relative;

    border: 1px dotted #b9b9b9;
    width: v-bind(btnSize);
    height: v-bind(btnSize);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #7a7a7a;
    border-radius: 8px;





    .anticon {
      cursor: pointer;
    }
  }
}
</style>
<style lang="scss">
.upload-file {

  .ant-progress {

    .ant-progress-text {
      color: white;
    }
  }
}

.uploader-preview {
  .ant-modal-content {
    padding: 12px 6px 6px;
    .ant-modal-title {
      text-align: center;
    }
  }
}
</style>