<script setup>
import { PlusCircleOutlined } from '@ant-design/icons-vue';
import { computed, onMounted, ref, unref, } from 'vue';
import { useUploader } from '../../request/uploader.js'
import _ from 'lodash'
import { Progress, Image } from 'ant-design-vue'
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
    type: Array,
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
  readonly: Boolean
})


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
    //const fileRes = props.dataResolver(data)
    const idx = uploads.value.indexOf(currentFile)
    console.log(currentFile, idx)
    if (idx > -1) {
      uploads.value.splice(idx, 1)
      files.value.push(props.dataResolver(currentFile))
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
  if (files.value.length > idx) {
    files.value.splice(idx, 1)
  }
}

const s = computed(() => widthMap[props.size || 'middle'])

const btnSize = computed(() => `${s.value}px`)
const previewSize = computed(() => `${s.value - 4}px`)
onMounted(() => {
  //setFileFromUrl(unref(value))
})

function getPreview(file) {
  // console.log(file)

  if (file.preview) {
    return file.preview
  }

  if (file.url) {
    const isImage = file.type ? file.type.indexOf('image/') == 0 : false

    if (isImageFile(file.url) || isImage) {
      if (file.url.indexOf('http://') == 0 || file.url.indexOf('https://') == 0) {
        return file.url
      }

      return props.urlPrefix + file.url
    }

    let partials = file.url.split('?')[0].split('.');
    let ext = partials[partials.length - 1];
    return getIconByExtention(ext)
  }

  return null
}

</script>
<template>
  <div class="upload-wrapper">
    <div class="upload-file" v-for="(file, index) in previewFiles" :key="index">
      <div class="upload-preview">
        <Image :src="getPreview(file)" :style="{ maxWidth: previewSize, maxHeight: previewSize }" />
      </div>
      <Progress type="circle" :size="s - 6" :percent="file.progress" v-if="file.uploading" />

      <a @click="removeFile(index)" v-if="!readonly && file.url && !file.uploading" class="upload-remove">移除</a>
    </div>
    <div class="upload-btn" v-if="!readonly && previewFiles.length < maxFiles">
      <PlusCircleOutlined @click="triggerUpload" />
    </div>

    <input ref="inputRef" type="file" style="display: none" @change="upload" :accept="accept">
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
</style>