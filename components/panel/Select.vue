<script setup>
import { Modal } from 'ant-design-vue'
import PanelTable from './Table.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Object, Array],
  },
  open: Boolean,
})
const tableRef = ref()
const emit = defineEmits(['update:modelValue', 'update:open', 'selected'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

const modalOpen = computed({
  get() {
    return props.open
  },
  set(v) {
    emit('update:open', v)
  }
})

function emitSelected() {
  emit('selected', value.value)
  modalOpen.value = false
}

defineExpose({
  refresh: () => tableRef.value && tableRef.value.refresh(),
  resetFilters: () => tableRef.value && tableRef.value.resetFilters()
})


const attrs = useAttrs()

</script>
<template>
  <div>
    <Modal v-model:open="modalOpen" width="80%" :title="title" :mask-closable="false" @cancel="modalOpen = false" @ok="emitSelected">
     <PanelTable v-bind="attrs" ref="tableRef" v-model="value" :scroll="{ x: 1000, y: '45vh' }"></PanelTable>
    </Modal>
  </div>
</template>
<style lang="scss" scoped>
</style>