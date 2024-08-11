<script setup>
import { Form, Button } from 'ant-design-vue'
import { computed, ref } from 'vue'
import {getRequest} from '../../request'
const request = getRequest()

const emit = defineEmits(['update:open', 'submitted'])

const props = defineProps({
  apiUrl: {
    type: String,
    required: true
  },
  model: Object,
  labelCol: {
    type: Object,
    default: () => ({ span: 5 })
  },
  wrapperCol: {
    type: Object,
    default: () => ({ span: 14 })
  },
  rules: Object,
  width: String | Number,
  okText: {
    type: String,
    default: () => "保存"
  }
})


const formState = computed(() => {
  return props.model
})


const formRef = ref()
const loading = ref(false)

const onSubmit = () => {
  loading.value = true
  request({
    url: props.apiUrl,
    method: 'post',
    data: formState.value
  }).then(res => {
    loading.value = false
    emit('submitted', formState)
  })
};

const okBtnProps = computed(() => {
  return {
    loading: loading.value
  }
})

const resetForm = () => {
  formRef.value.resetFields();
};


defineExpose({resetForm})

</script>
<template>
  <Form @finish="onSubmit" ref="formRef" :model="formState" :rules="rules" :label-col="labelCol"
    :wrapper-col="wrapperCol">
    <slot></slot>
    <div class="form-actions">
      <Button type="primary" html-type="submit">{{ okText }}</Button>
      <Button @click="resetForm">重置</Button>
    </div>
  </Form>
</template>
<style lang="scss" scoped>
.form-actions {

  button {
    margin-left: 12px;
    float: right;
  }
}
</style>