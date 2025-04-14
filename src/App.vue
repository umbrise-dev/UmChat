<template>
  <div class="flex items-center justify-between h-screen">
    <div class="w-[300px] bg-gray-200 h-full border-r border-gray-300">
      <div class="h-[90%] overflow-y-auto">
        <ConversationList :items="items" />
      </div>
      <div class="h-[10%] grid grid-cols-2 gap-2 p-2">
        <RouterLink to="/">
          <Button icon-name="radix-icons:chat-bubble" class="w-full">
            {{ t('common.newChat') }}
          </Button>
        </RouterLink>
        <RouterLink to="/settings">
          <Button icon-name="radix-icons:gear" plain class="w-full">
            {{ t('common.settings') }}
          </Button>
        </RouterLink>
      </div>
    </div>
    <div class="h-full flex-1">
      <RouterView />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ConversationList from "@/components/ConversationList.vue"
import Button from "@/components/Button.vue";
import { computed, onMounted } from "vue";
import { db, initProviders } from "@/db";
import { useConversationStore } from "./stores/conversation";
import { useProviderStore } from "./stores/provider";
import { useI18n } from 'vue-i18n';
import { initI18n } from './i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
const conversationStore = useConversationStore()
const providerStore = useProviderStore()
const items = computed(() => conversationStore.items)
const { t } = useI18n()

window.electronAPI.onMenuNewConversation(() => {
  router.push('/')
})

onMounted(async() => {
  await initProviders()
  await initI18n()
  conversationStore.fetchConversations()
  providerStore.fetchProviders()
})
</script>