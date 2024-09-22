<script setup>
import Quill from '../../../editor/quill/Index.vue'
import { computed } from "vue";
const urlPrefix = import.meta.env.VITE_FILE_BASE_URL

const props = defineProps({
  modelValue: {
    type: String,
  },
  col: Object,
  isFilter: Boolean,
  detail: Boolean
})

const plh = computed(() => {
  return `请输入${props.col?.title}${props.isFilter ? '筛选' : ''}`
})
const emit = defineEmits(['update:modelValue'])

const modelData = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

</script>
<template>
  <Quill :placeholder="plh" v-model="modelData" :disabled="detail" :url-prefix="urlPrefix"></Quill>
</template>
<style lang="scss" scoped></style>