<script setup>
import AntSelect from '../../../select/AntSelect.vue'
import { computed, useAttrs } from 'vue'
const props = defineProps({
  col: Object,
  isFilter: Boolean,
})


const attrs = useAttrs()

const plh = computed(() => {
  return `请选择${props.col?.title}${props.isFilter ? '筛选' : ''}`
})


</script>
<template>
  <AntSelect v-bind="attrs" :placeholder="plh"></AntSelect>
</template>
<style lang="scss" scoped></style>