<script setup>
import { Tree } from 'ant-design-vue';
import { computed } from 'vue';
const props = defineProps({
  dataSource: Array,
  modelValue: Array
})
const emit = defineEmits(['update:modelValue'])
const checkedKeys = computed({
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

</script>
<template>
  <Tree v-model:checkedKeys="checkedKeys" checkable :tree-data="treeData">

  </Tree>
</template>
<style lang="scss" scoped></style>