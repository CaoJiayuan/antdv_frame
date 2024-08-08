<script setup>
import { Select, SelectOption } from 'ant-design-vue'
import { computed, onMounted, ref, useSlots, watch } from 'vue'
import request from '../../request'

const props = defineProps({
  modelValue: [Array, String, Number],
  apiUrl: String,
  valueKey: {
    type: String,
    default: () => 'value'
  },
  textKey: {
    type: String,
    default: () => 'text'
  },
  requestMethod: {
    type: String,
    default: () => 'get'
  },
  dataSource: [Array, Promise],
  respResolver: {
    type: Function,
    default: (data, props) => data.map(item => {
      return {
        text: item[props.textKey],
        value: item[props.valueKey],
        source: item
      }
    })
  }
})

const data = ref([])

function loadList() {
  request({
    url: props.apiUrl,
    method: props.requestMethod
  }).then((req) => data.value = props.respResolver(req.data, props))
}

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

onMounted(() => {
  if (props.apiUrl) {
    loadList()
  } else {
    Promise.resolve(props.dataSource).then(val => {
      data.value = val
    })
  }
})

watch(() => props.apiUrl, (now, old) => {
  if (now) {
    loadList()
  }
})

watch(() => props.dataSource, (now, old) => {
  if (now) {
    data.value = now
  }
})

const slots = useSlots()

</script>
<template>
  <Select v-model:value="value">
    <SelectOption v-for="item in data" :key="item.value" :value="item.value">
      <template v-if="!slots['item-text']">
        {{ item.text }}
      </template>
      <slot name="item-text" :item="item"></slot>
    </SelectOption>
  </Select>
</template>
<style lang="scss" scoped></style>