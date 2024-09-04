<script setup>
import { Col, Row, FormItem } from 'ant-design-vue'
import Form from '../form/Form.vue'
import { usePanelStore } from "./index.js"
const { hasFormComponent } = usePanelStore()
import { renderFormComponent } from './form'
import { functions } from 'nerio-js-utils'
import { computed } from 'vue'
const { useAsFunction } = functions

import _ from 'lodash'

/**
{
  name: 'name',
  type: 'input',
  title: ''
} 
 */

const props = defineProps({
  fields: {
    type: Array,
    default: () => []
  },
  modelValue: Object,
  detail: Boolean
})


const fmtFields = computed(() => {
  return props.fields.map(field => {

    const item = _.clone(field)
    item.if = item.if || (() => true)
    const props = item.props || {}

    item.props = Object.assign({}, props, {
      col: item
    })


    return item
  })
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})


</script>
<template>
  <Form v-model:model="model">
    <Row :gutter="[12, 0]">
      <template v-for="field in fmtFields" :key="field.name">
        <Col v-bind="field.col || { span: 24 }">
        <FormItem :name="field.name" :label="field.hideTitle ? undefined : field.title" :rules="field.rules"
          :help="useAsFunction(field.help)(model)" v-if="field.if(model, detail)"
          :wrapperCol="field.wrapperCol || undefined" :label-col="field.labelCol || undefined">
          <template v-if="field.slot">
            <slot :name="field.slot" :post="model" :column="field" :detail="detail"></slot>
          </template>
          <component v-else-if="hasFormComponent(field.type)"
            :is="renderFormComponent(field.type, model, field.name, useAsFunction(field.props)(field))">
          </component>
        </FormItem>
        </Col>
      </template>
    </Row>
  </Form>
</template>
<style lang="scss" scoped></style>