<template>
  <div class="conversation-list">
    <div
      class="item border-gray-300 border-t cursor-pointer p-2"
      :class="{
        'bg-gray-200 hover:bg-gray-300': conversationStore.selectedId === item.id,
        'bg-white hover:bg-gray-200': conversationStore.selectedId !== item.id,
      }"
      v-for="item in items"
      :key="item.id"
      @contextmenu.prevent="showContextMenu(item.id)"
    >
    <a @click="goToConversation(item.id)">
      <div class="flex justify-between items-center text-sm leading-5 text-gray-500">
        <span>{{ item.selectedModel }}</span>
        <span>{{ dayjs(item.updatedAt).format('YYYY-MM-DD') }}</span>
      </div>
      <h2 class="font-semibold leading-6 text-gray-900 truncate">{{ item.title }}</h2>
    </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ConversationProps } from "@/types"
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { onMounted } from 'vue'
import { useConversationStore } from "@/stores/conversation";

defineProps<{ items: ConversationProps[] }>()
const conversationStore = useConversationStore()
const router = useRouter()

const showContextMenu = (id: number) => {
  window.electronAPI.showContextMenu(id)
}

onMounted(() => {
  window.electronAPI.onDeleteConversation(async (id: number) => {
    try {
      await conversationStore.deleteConversation(id)
      console.log('delete conversation', id)
      console.log('current selectedId:', conversationStore.selectedId)
      
      // 先设置 selectedId 为 -1
      conversationStore.selectedId = -1
      // 强制重定向到首页
      await router.replace('/')
      console.log('Redirected to home page')
    } catch (error) {
      console.error('Error during conversation deletion:', error)
    }
  })
})

const goToConversation = (id: number) => {
  router.push({ path: `/conversation/${id}`})
  conversationStore.selectedId = id
}
</script>