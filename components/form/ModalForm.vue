<script setup>
import { Modal, Form, message } from 'ant-design-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, readonly, ref } from 'vue'
import { getRequest } from '../../request'
import { useDraggable } from '@vueuse/core'
import { functions } from 'nerio-js-utils'
import md5 from 'blueimp-md5'
const { useAsFunction } = functions
import { waitingFor } from '../../utils/functions'

const request = getRequest()
const uuid = ref(md5(new Date().toString()))
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


const handle = ref(null)

const vw = ref(document.body.offsetWidth)

const vh = ref(document.body.offsetHeight)

const height = ref(0)
function loadHeight() {
  nextTick(() => {
    setTimeout(() => {
      waitingFor(() => document.querySelector(`.modal-form-${uuid.value}`)).then(el => {
        height.value = el.offsetHeight
      })
    }, 400)
  })
}
const contetWidth = computed(() => {
  var w = parseInt(props.w)

  if (handle.value != null) {
    w = handle.value.offsetWidth + 20
  }

  return w
})


function onResize() {
  vw.value = document.body.offsetWidth
  vh.value = document.body.offsetHeight
}

onMounted(() => {
  vw.value = document.body.offsetWidth
  loadHeight()
  window.addEventListener('resize', onResize)
})


onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})



const offset = computed(() => {

  return parseInt(vw.value / 2 - contetWidth.value / 2) + 10
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
  loadHeight()

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


  var offsetX = offset.value
  var offsetY = 10

  var padding = 8;

  // width handle.value.offsetWidth

  var top = y.value - offsetY
  var left = x.value - offsetX


  if (y.value <= offsetY + padding) {
    top = padding
  }

  const maxY = (vh.value - height.value - padding)

  if (y.value >= maxY && maxY > 0) {
    top = maxY
  }

  if (x.value <= padding + 10) {
    left = padding - offsetX + 10
  }

  const maxX = (vw.value - contetWidth.value - padding + 10)

  if (x.value >= maxX) {
    // left = offsetX - padding - 10
    left = maxX - offsetX
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    // transformOrigin: '0 0'
  }
})

</script>
<template>
  <Modal :width="width" :ok-button-props="okBtnProps" :mask-closable="false" v-model:open="modalOpen" @ok="onSubmit"
    @cancel="resetForm" class="modal-form" :style="modelStyle" :class="`modal-form-${uuid}`">
    <template #title>
      <div ref="handle" style="touch-action:none;cursor: move;">
        {{ title }}
      </div>
    </template>
    <Form ref="formRef" :class="{ 'detail-form': showDetail }" :model="formState" :rules="rules" :label-col="labelCol"
      :wrapper-col="wrapperCol" :disabled="showDetail">
      <slot :showDetail="showDetail"></slot>
    </Form>
  </Modal>
</template>
<style lang="scss">
.modal-form {
  padding-bottom: 0;

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

.detail-form {
  .ant-form-item-control {

    input,
    .ant-select-selection-item,
    .ant-picker input {
      color: #666666;
    }
  }
}
</style>