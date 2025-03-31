<template>
  <div class="flex items-center justify-between h-screen">
    <div class="w-[300px] bg-gray-200 h-full border-r border-gray-300">
      <ConversationList :items="items" />
    </div>
    <div class="h-full flex-1">
      content
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ConversationProps } from "@/types"
import ConversationList from "@/components/ConversationList.vue";

const items: ConversationProps[] = [
  { id: 1, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘1', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
  { id: 2, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘2', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
  { id: 3, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘3', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
  { id: 4, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘4', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
]
</script>