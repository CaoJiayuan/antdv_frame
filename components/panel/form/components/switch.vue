<script setup>
import {Switch} from 'ant-design-vue'
import { computed, useAttrs } from 'vue'
const props = defineProps({
  col: Object,
  modelValue: {
    type: Boolean,
  },
  isFilter: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

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
  <Switch v-bind="attrs" v-model:checked="modelData"></Switch>
</template>
<style lang="scss" scoped></style>