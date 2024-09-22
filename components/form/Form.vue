<script setup>
import { Form, Button, message } from 'ant-design-vue'
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
    default: () => ({ span: 19 })
  },
  rules: Object,
  width: String | Number,
  okText: {
    type: String,
    default: () => "保存"
  },
  successMsg: {
    type: String,
    default: () => "保存成功"
  },
  method: {
    type: String,
    default: () => "post"
  },
  disabled: {
    type: Boolean,
  },
  readonly: {
    type: Boolean,
  },
  dataResolver: {
    type: Function,
    default: data => {
      return data
    }
  },
  reset: {
    type: Boolean,
    default: () => true
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
    method: props.method,
    data: props.dataResolver(formState.value)
  }).then(res => {
    loading.value = false
    message.info(props.successMsg)
    emit('submitted', formState)
  }).catch((e) => {
    loading.value = false
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
  <Form @finish="onSubmit" ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :disabled="disabled"
    :wrapper-col="wrapperCol">
    <slot></slot>
    <div class="form-actions" v-if="!readonly">
      <Button type="primary" html-type="submit" v-bind="okBtnProps">{{ okText }}</Button>
      <Button @click="resetForm" v-if="reset">重置</Button>
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