<script setup>
import { PlusCircleOutlined } from '@ant-design/icons-vue';
import { computed, onMounted, ref, unref, watch } from 'vue';
import { useUploader } from '../../request/uploader.js'

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
      return data.url
    }
  },
  modelValue: String
})

const value = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

const inputRef = ref()

const { file, uploadFile, reset, setFileFromUrl } = useUploader(props.url)


function upload(e) {
  uploadFile(e.target.files[0]).then((data) => {
    value.value = props.dataResolver(data)
  })
}

function triggerUpload() {
  inputRef.value.click()
}

function resetFile() {
  reset()
  inputRef.value.value = ''
  value.value = ''
}

const s = computed(() => widthMap[props.size || 'middle'])

const btnSize = computed(() => `${s.value}px`)
const previewSize = computed(() => `${s.value - 4}px`)
onMounted(() => {
  setFileFromUrl(unref(value))
})

const fileItem = computed(() => {
  if (file.value.valid && unref(value)) {
    return file.value
  }
  setFileFromUrl(value.value)
  return file.value
})

</script>
<template>
  <div class="upload-wrapper">
    <div class="upload-btn">
      <PlusCircleOutlined @click="triggerUpload" v-if="!file.uploading" />
      <Progress type="circle" :size="s - 6" :percent="file.progress" v-if="file.uploading" />
      <div class="upload-preview">
        <Image :src="fileItem.preview" v-if="fileItem.preview" :style="{maxWidth: previewSize, maxHeight: previewSize}"/>
      </div>
    </div>
    <a style="color: red;margin-left: 10px;" @click="resetFile" v-if="fileItem.url">移除</a>
    <input ref="inputRef" type="file" style="display: none" @change="upload">
  </div>
</template>
<style lang="scss" scoped>
.upload-wrapper {
  position: relative;

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

    .ant-progress {
      position: absolute;
    }
    .upload-preview {
      position: absolute;
    }

    .anticon {
      cursor: pointer;
    }
  }
}
</style>