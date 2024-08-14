<script setup>
import { DatePicker } from "ant-design-vue";
import { computed } from "vue";
const props = defineProps({
  modelValue: {
    type: String,
  },
  col: Object,
  isFilter: Boolean,
  type: {
    type: String,
    default: () => 'date'
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
  <DatePicker v-model:value="modelData" :value-format="typeFormats[type]" :format="typeFormats[type]" :showTime="type === 'datetime'" allow-clear/>
</template>
<style lang="scss" scoped></style>