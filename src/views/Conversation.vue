<template>
  <div class="h-[10%] bg-gray-200 border-b border-gray-300 flex items-center px-3 justify-between">
    <h3 class="font-semibold text-gray-900">{{ conversation?.title }}</h3>
    <span class="text-sm text-gray-500">{{ conversation?.updatedAt }}</span>
  </div>
  <div class="w-[80%] mx-auto h-[85%] overflow-y-auto pt-2">
    <MessageList :messages="filteredMessages"/>
  </div>
  <div class="w-[80%] mx-auto h-[15%] flex items-center">
    <MessageInput @create="sendNewMessage" v-model="inputValue" :disabled="messageStore.isMessageLoading" />
  </div>
  </template>

<script lang="ts" setup>
import MessageInput from '@/components/MessageInput.vue'
import MessageList from '@/components/MessageList.vue';
import { useRoute } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { MessageProps } from '@/types';
import { watch } from 'vue';
import { db } from '@/db';
import { useConversationStore } from '@/stores/conversation';
import { useMessageStore } from '@/stores/message';

const route = useRoute()
const conversationStore = useConversationStore()
const messageStore = useMessageStore()
let conversationId = ref(parseInt(route.params.id as string))
const filteredMessages = computed(() => messageStore.items)
const conversation = computed(() => conversationStore.getConversationById(conversationId.value))
const initMessageId = parseInt(route.query.init as string)
let lastQuestion = computed(() => messageStore.getLastQuestion(conversationId.value))
const inputValue = ref('')

const sendedMessages = computed(() => filteredMessages.value
  .filter(message => message.status !== 'loading')
  .map(message => {
    return {
      role: message.type === 'question' ? 'user': 'assistant',
      content: message.content,
    }
  })
)

const sendNewMessage = async (question: string) => {
  if (question) {
    const date = new Date().toISOString()
    await messageStore.createMessage({
      content: question,
      conversationId: conversationId.value,
      createdAt: date,
      updatedAt: date,
      type: 'question',
    })
    inputValue.value = ''
    creatingInitialMessage()
  }
}

const creatingInitialMessage = async () => {
  const createdData: Omit<MessageProps, 'id'> = {
    content: '',
    conversationId: conversationId.value,
    type: 'answer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'loading'
  }
  const newMessageId = await messageStore.createMessage(createdData)
  if (conversation.value) {
    const provider = await db.providers.where({ id: conversation.value.providerId }).first()
    if (provider) {
      await window.electronAPI.startChat({
        messageId: newMessageId,
        providerName: provider.name,
        selectedModel: conversation.value.selectedModel,
        messages: sendedMessages.value,
      })
    }
  }
}

watch(() => route.params.id, async (newId: string) => {
  conversationId.value = parseInt(newId)
  await messageStore.fetchMessagesByConversation(conversationId.value)
})

onMounted(async () => {
  await messageStore.fetchMessagesByConversation(conversationId.value)
  if (initMessageId) {
    await creatingInitialMessage()
  }

  window.electronAPI.onUpdateMessage(async (streamData) => {
    console.log('streamData', streamData)
    messageStore.updateMessage(streamData)
  })
})
</script>