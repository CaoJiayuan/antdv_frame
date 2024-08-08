<script setup>
import { RangePicker } from "ant-design-vue";
import { computed } from "vue";
const props = defineProps({
  modelValue: {
    type: String,
  },
  col: Object,
  isFilter: Boolean,
  allowEmpty: {
    type: Array,
    default: () => [true, true]
  },
  type: {
    type: String,
    default: () => 'datetime'
  },
})


const typeFormats = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm:ss',
}

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
  <RangePicker v-model:value="modelData" :value-format="typeFormats[type]" :format="typeFormats[type]" :showTime="type === 'datetime'" :allowEmpty="allowEmpty"/>
</template>
<style lang="scss" scoped></style>