<template>
  <div class="h-[10%] bg-gray-200 border-b border-gray-300 flex items-center px-3 justify-between" v-if="conversation">
    <h3 class="font-semibold  text-gray-900">{{ conversation.title }}</h3>
    <span class="text-sm text-gray-500">{{ conversation.updatedAt }}</span>
  </div>
  <div class="w-[80%] mx-auto h-[75%] overflow-y-auto pt-2">
    <MessageList :messages="filteredMessages" ref="messageListRef" />
  </div>
  <div class="w-[80%] mx-auto h-[15%] flex items-center">
    <MessageInput  @create="sendNewMessage" v-model="inputValue" :disabled="messageStore.isMessageLoading" />
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MessageInput from '@/components/MessageInput.vue'
import MessageList from '@/components/MessageList.vue'
import { useConversationStore } from '@/stores/conversation'
import { useMessageStore } from '@/stores/message'
import { useProviderStore } from '@/stores/provider'
import { MessageListInstance, MessageProps, MessageStatus } from '@/types'

const inputValue = ref('')
const route = useRoute()
const conversationStore = useConversationStore()
const messageStore = useMessageStore()
const provdierStore = useProviderStore()
const filteredMessages = computed(() => messageStore.items)
const sendedMessages = computed(() => filteredMessages.value
  .filter(message => message.status!== 'loading')
  .map(message => {
    return {
      role: message.type === 'question' ? 'user' : 'assistant',
      content: message.content,
      ...(message.imagePath && { imagePath: message.imagePath }),
    }
  })
)
let conversationId = ref(parseInt(route.params.id as string))
const initMessageId = parseInt(route.query.init as string)
const conversation = computed(() => conversationStore.getConversationById(conversationId.value))
const messageListRef = ref<MessageListInstance>()

const sendNewMessage = async (question: string, imagePath?: string) => {
  if (question) {
    let copiedImagePath: string | undefined
    if (imagePath) {
      try {
        copiedImagePath = await window.electronAPI.copyImageToUserDir(imagePath)
        console.log('Image copied to user directory:', copiedImagePath)
      } catch (error) {
        console.error('Error copying image:', error)
      }
    }
    const date = new Date().toISOString()
    await messageStore.createMessage({
      content: question,
      conversationId: conversationId.value,
      createdAt: date,
      updatedAt: date,
      type: 'question',
      ...(copiedImagePath && { imagePath: copiedImagePath }),
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
  await messageScrollToBottom()
  if (conversation.value) {
    const provider = provdierStore.getProviderById(conversation.value.providerId)
    if (provider) {
      console.log('provider', provider)
      await window.electronAPI.startChat({
        messageId: newMessageId,
        providerName: provider.name,
        selectedModel: conversation.value.selectedModel,
        messages: sendedMessages.value,
      })
    }
  }
}

const messageScrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.ref.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    })
  }
}

watch(() => route.params.id, async (newId: string) => {
  conversationId.value = parseInt(newId)
  await messageStore.fetchMessagesByConversation(conversationId.value)
  await messageScrollToBottom()
})

onMounted(async () => {
  await messageStore.fetchMessagesByConversation(conversationId.value)
  await messageScrollToBottom()
  if (initMessageId) {
    await creatingInitialMessage()
  }

  let currentMessageListHeight = 0
  let streamContent = ''
  const checkAndScrollToBottom = async () => {
    if (messageListRef.value) {
      const newHeight = messageListRef.value.ref.clientHeight
      if (newHeight > currentMessageListHeight) {
        console.log('current height', newHeight)
        currentMessageListHeight = newHeight
        await messageScrollToBottom()
      }
    }
  }

  window.electronAPI.onUpdateMessage(async (streamData) => {
    console.log('streamData', streamData)
    const { messageId, data } = streamData
    streamContent += data.result
    const updatedData = {
      content: streamContent,
      status: data.is_end ? 'finished' : 'streaming' as MessageStatus,
      updatedAt: new Date().toISOString(),
    }
    await messageStore.updateMessage(messageId, updatedData)
    await nextTick()
    checkAndScrollToBottom()
    if (data.is_end) {
      streamContent = ''
    }
  })
})
</script>