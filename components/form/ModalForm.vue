<script setup>
import { Modal, Form, message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import request from '../../request'

const emit = defineEmits(['update:open', 'submitted'])

const props = defineProps({
  open: Boolean,
  title: String,
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
    default: () => ({ span: 20 })
  },
  rules: Object,
  width: String | Number,
  successMsg: {
    type: String,
    default: () => "保存成功"
  },
  method: {
    type: String,
    default: () => "post"
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

const formState = computed(() => {
  return props.model
})


const formRef = ref()
const loading = ref(false)

const onSubmit = () => {
  loading.value = true
  formRef.value
    .validate()
    .then(() => {
      return request({
        url: props.apiUrl,
        method: props.method,
        data: formState.value
      }).then(res => {
        loading.value = false
        message.info(props.successMsg)
        emit('submitted', formState)
      })
    })
    .catch(error => {
      loading.value = false
    });
};

const okBtnProps = computed(() => {
  return {
    loading: loading.value
  }
})

const resetForm = () => {
  formRef.value.resetFields();
};

const openModal = () => {
  modalOpen.value = true

  return () => {
    resetForm()
    modalOpen.value = false
  }
}

defineExpose({ openModal })

</script>
<template>
  <Modal :width="width" :ok-button-props="okBtnProps" :mask-closable="false" v-model:open="modalOpen" @ok="onSubmit"
    :title="title" @cancel="resetForm" class="modal-form">
    <Form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
      <slot></slot>
    </Form>
  </Modal>
</template>
<style lang="scss">
.modal-form {
  .ant-modal-content {
    padding: 18px 10px 10px;

    .ant-modal-header {
      text-align: center;
    }

    .ant-modal-body {
      padding: 12px 2px;
    }
  }
}
</style>