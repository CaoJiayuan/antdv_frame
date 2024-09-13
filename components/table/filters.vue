<script setup>
import { computed } from "vue"
import { Button, Form } from 'ant-design-vue'


const props = defineProps({
  modelValue: {
    type: Object,
  },
  labelCol: {
    type: Object,
  },
  wrapperCol: {
    type: Object,
  }
})

const emit = defineEmits(['update:modelValue', 'reset', 'apply'])

const modelData = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

const applyFilters = () => {
  emit('apply', props.modelValue.value)
}

const resetFilters = () => {
  emit('reset')
}

</script>
<template>
  <div class="table-filters">
    <Form ref="filterFormRef" layout="inline" :model="modelValue" :label-col="labelCol" :wrapper-col="wrapperCol">
      <div class="filter-fields">
        <slot name="filters" :filters="modelValue"></slot>
        <div class="filter-actions">
          <Button @click="resetFilters">重置</Button>
          <Button type="primary" @click="applyFilters">筛选</Button>
        </div>
      </div>
    </Form>
  </div>
</template>
<style lang="scss" scoped>
.table-filters {
  .ant-form-inline {
    justify-content: space-between;
    row-gap: 8px;
  }

  .filter-fields {
    display: flex;
    flex-wrap: wrap;
    row-gap: 8px;
    width: 100%;
    :deep(.ant-form-item-label) {
      font-weight: 600;
    }
  }

  .filter-actions {
    width: 100%;

    button+button {
      margin-left: 6px;
    }

    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
}
</style>