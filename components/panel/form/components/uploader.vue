<script setup>
import UploadFile from '../../../upload/file.vue'
const urlPrefix = import.meta.env.VITE_FILE_BASE_URL

import { useAttrs } from "vue";
const props = defineProps({
  col: Object,
  isFilter: Boolean,
  detail: Boolean
})

const attrs = useAttrs()

</script>
<template>
  <UploadFile v-bind="attrs" :url-prefix="urlPrefix" :readonly="detail"/>
</template>
<style lang="scss" scoped></style>