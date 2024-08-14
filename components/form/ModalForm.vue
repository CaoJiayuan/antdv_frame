<script setup>
import { Modal, Form, message } from 'ant-design-vue'
import { computed, onMounted, readonly, ref } from 'vue'
import { getRequest } from '../../request'
import { useDraggable } from '@vueuse/core'
import { functions } from 'nerio-js-utils'

const { useAsFunction } = functions
const request = getRequest()

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
  width: {
    type: [String, Number],
    default: () => 500
  },
  successMsg: {
    type: String,
    default: () => "保存成功"
  },
  method: {
    type: String,
    default: () => "post"
  },
  dataResolver: {
    type: Function,
    default: data => {
      return data
    }
  },
  initPosition: {
    type: [Object, Function],
  },
  disabled: {
    type: Boolean
  }
})
const showDetail = ref(props.disabled)
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
        data: props.dataResolver(formState.value)
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
    loading: loading.value,
    style: {
      display: showDetail.value ? 'none' : ''
    }
  }
})

const resetForm = () => {
  formRef.value.resetFields();
};



const vw = computed(() => document.body.offsetWidth)

const handle = ref(null)

const offset = computed(() => {
  var width = parseInt(props.w)

  if (handle.value != null) {
    width = handle.value.offsetWidth + 20
  }

  return parseInt(vw.value / 2 - width / 2) + 10
})

const initPos = computed(() => {
  if (props.initPosition) {
    return useAsFunction(props.initPosition)(offset.value)
  }

  return { x: offset.value, y: 100 }
})

const { x, y } = useDraggable(handle, {
  preventDefault: true,
  initialValue: initPos.value
})

const openModal = (config) => {
  modalOpen.value = true
  showDetail.value = config?.detail || false
  x.value = offset.value
  y.value = 100
  
  return () => {
    resetForm()
    modalOpen.value = false
  }
}

defineExpose({ openModal })

const modelStyle = computed(() => {
  if (handle.value == null) {
    return {}
  }


  var offsetValue = offset.value

  // width handle.value.offsetWidth

  return {
    top: `${y.value - 10}px`,
    left: `${x.value - offsetValue}px`,
    // transformOrigin: '0 0'
  }
})

</script>
<template>
  <Modal :width="width" :ok-button-props="okBtnProps" :mask-closable="false" v-model:open="modalOpen" @ok="onSubmit"
    @cancel="resetForm" class="modal-form" :style="modelStyle" >
    <template #title>
      <div ref="handle" style="touch-action:none;cursor: move;">
        {{ title }}
      </div>
    </template>
    <Form ref="formRef" :model="formState" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol" :disabled="showDetail">
      <slot :showDetail="showDetail"></slot>
    </Form>
  </Modal>
</template>
<style lang="scss">
.modal-form {
  .ant-modal-content {
    padding: 10px;

    .ant-modal-header {
      text-align: center;
    }

    .ant-modal-body {
      padding: 12px 2px;
    }
  }
}
</style>