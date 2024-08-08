<script setup>
import { InputPassword } from "ant-design-vue";
import { computed } from "vue";
const props = defineProps({
  modelValue: {
    type: String,
  },
  col: Object,
  isFilter: Boolean,
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


const plh = computed(() => {
  return `请输入${props.col?.title}${props.isFilter ? '筛选' : ''}`
})

</script>
<template>
  <InputPassword autocomplete="new-password" v-model:value="modelData" :placeholder="plh" allow-clear/>
</template>
<style lang="scss" scoped></style>