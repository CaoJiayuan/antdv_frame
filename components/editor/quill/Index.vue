<script setup>
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { functions } from 'nerio-js-utils';
import { computed, onMounted, ref, unref, useAttrs } from 'vue';
import { Progress } from 'ant-design-vue'
import { useUploader } from '../../../request/uploader.js'
import BlotFormatter from 'quill-blot-formatter'
const { fastRandom } = functions;
const toolbarId = computed(() => {
  return 'quill-tb-' + fastRandom()
})

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  uploadUrl: {
    type: String,
    default: () => 'upload'
  },
  modelValue: String,
  minHeight: {
    type: [Number, String],
    default: 200
  },
  urlPrefix: {
    type: String,
    default: ''
  },
  disabled: Boolean
})

const content = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})
const modules = [
  {
    name: 'blotFormatter',
    module: BlotFormatter,
    options: {/* options */ }
  }
]

const upload = ref(null)
const editor = ref(null)
var quill = null

const { uploads, uploadFile } = useUploader(props.uploadUrl)

const file = computed(() => {
  if (uploads.value.length === 0) {
    return {}
  }

  return uploads.value[0]
})

function imgHandler(state) {
  if (state) {
    const input = unref(upload)
    input.value = null;
    input.click();
  }
}

const uploadImg = (e) => {
  let f = e.target.files[0];
  if (f) {
    uploadFile(f, {
      validate: file => file.isImage(),
    }).then(data => {
      let url = data.url;
      if (quill) {
        let range = quill.getSelection();
        quill.insertEmbed(range !== null ? range.index : 0, 'image', props.urlPrefix + url, Quill.sources.USER);
      }
    });
  }
}

onMounted(() => {
  quill = unref(editor).getQuill()
  quill.getModule('toolbar').addHandler('image', imgHandler);
  if (quill.container) {
    quill.container.style.minHeight = `${props.minHeight}px`
  }
})


const attrs = useAttrs()
</script>
<template>
  <div class="quill-wrapper">
    <input accept="image/*" type="file" ref="upload" @change="uploadImg" style="display: none;">
    <QuillEditor content-type="html" v-model:content="content" ref="editor" theme="snow" :toolbar="`#${toolbarId}`"
      :modules="modules" v-bind="attrs">
      <template #toolbar>
        <div :id="toolbarId">
          <span class="ql-formats">
            <select class="ql-header">
              <option value="1">一级标题</option>
              <option value="2">二级标题</option>
              <option value="3">三级标题</option>
              <option value="4">四级标题</option>
              <option value="5">五级标题</option>
              <option value="6">六级标题</option>
              <option selected="selected" value="0">正文</option>
            </select>
            <select name="size" class="ql-size">
              <option value="small">小</option>
              <option selected>中</option>
              <option value="large">大</option>
              <option value="huge">很大</option>
              <!--<option :value="s" v-for="s in sizes">{{s}}</option>-->
            </select>
          </span>
          <span class="ql-formats">
            <select class="ql-color" title="'Char color'">
            </select>
            <select class="ql-background" title="'Bg color'">
            </select>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-bold">
              <strong>B</strong>
            </button>
            <button type="button" class="ql-italic"></button>
            <button type="button" class="ql-underline"></button>
            <select class="ql-align">
              <option selected=""></option>
              <option value="center"></option>
              <option value="right"></option>
              <option value="justify"></option>
            </select>
            <button type="button" class="ql-strike"></button>
            <!--<button class="ql-indent" @click="indent = !indent"><i class="fa fa-indent" style="font-size: 16px"></i></button>-->
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-blockquote"></button>
            <button type="button" class="ql-code-block"></button>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-header" value="1"></button>
            <button type="button" class="ql-header" value="2"></button>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-list" value="ordered"></button><button type="button" class="ql-list"
              value="bullet"></button>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-script" value="sub"></button><button type="button" class="ql-script"
              value="super"></button>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-indent" value="-1"></button><button type="button" class="ql-indent"
              value="+1"></button>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-direction" value="rtl"></button>
          </span>

          <span class="ql-formats upload-img" style="position: relative;">
            <button type="button" class="ql-image">
            </button>
            <Progress type="circle" :size="26" :show-info="false" :percent="file.progress" v-if="file.uploading" />
          </span>
        </div>
      </template>
    </QuillEditor>
    <div class="quill-cover" v-if="disabled">

    </div>
  </div>
</template>
<style lang="scss" scoped>
.quill-wrapper {
  position: relative;
  .ql-toolbar {
    border-radius: 8px 8px 0 0;
  }
  overflow: hidden;
  .upload-img {
    .ant-progress {
      position: absolute;
      left: 2px;
      top: -1px;
    }
  }
  
  .quill-cover {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(100, 100, 100, 0.1);
    border-radius: 8px;
  }
}
</style>

<style lang="scss">
.quill-wrapper {
  .ql-container {
    border-radius: 0 0 8px 8px;
  }
}

</style>