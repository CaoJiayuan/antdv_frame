<script setup>
import { PullRefresh, List } from "vant";
import { usePagination } from '../request/pagination.js'
import { ref, watch } from "vue";
const props = defineProps({
  apiUrl: {
    type: String,
    required: true
  },
  pageSize: {
    type: Number,
    default: () => 15
  },
})
const emit = defineEmits(['loaded'])
const refreshing = ref(false)
const { loading, meta, data, paginate, loaded, finished } = usePagination(emit)

function refresh(data = {}) {
  refreshing.value = true
  paginate(props.apiUrl, data).finally(() => refreshing.value = false)
}

function nextPage() {
  paginate(props.apiUrl, {
    page: meta.value.page + 1
  }, true)
}

refresh()

watch(() => props.apiUrl, now => refresh())

defineExpose({refresh})
</script>
<template>
  <div>
    <PullRefresh v-model="refreshing" @refresh="refresh">
      <List :immediate-check="false" @load="nextPage" finished-text="没有更多了" v-model="loading"
        :finished="finished">
        <template v-for="item in data">
          <slot :item="item" name="item"></slot>
        </template>
      </List>
    </PullRefresh>
  </div>
</template>
<style lang="scss" scoped></style>