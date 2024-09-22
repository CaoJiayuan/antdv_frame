<script setup>
import { TreeSelect } from 'ant-design-vue';
import { computed } from 'vue';
const props = defineProps({
  dataSource: Array,
  modelValue: [Array, Object],
  col: Object,
  isFilter: Boolean,
  detail: Boolean
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

const treeData = computed(() => {
  return props.dataSource
})
const plh = computed(() => {
  return props.detail ? '' : `请选择${props.col?.title}${props.isFilter ? '筛选' : ''}`
})

</script>
<template>
  <TreeSelect v-model:value="modelData" :tree-data="treeData" allow-clear :placeholder="plh">

  </TreeSelect>
</template>
<style lang="scss" scoped></style>