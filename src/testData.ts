import { ConversationProps, MessageProps, ProviderProps } from "./types";

export const providers: ProviderProps[] = [
  {     
    id: 1,
    name: 'qianfan',
    title: '百度千帆',
    desc: '文心一言 百度出品的大模型',
    models: ['ERNIE-4.0-8K', 'ERNIE-3.5-8K', 'ERNIE-Speed-8K'],
    avatar: 'https://qph.cf2.poecdn.net/main-thumb-pb-3004-50-jougqzjtwfqfyqprxbdwofvnwattmtrg.jpeg',
    createdAt: '2024-07-03',
    updatedAt: '2024-07-03'
  },
  {     
    id: 2,
    name: 'dashscope',
    title: '阿里百炼',
    desc: '通义千问',
    // https://help.aliyun.com/zh/dashscope/developer-reference/api-details?spm=a2c4g.11186623.0.0.5bf41507xgULX5#b148acc634pfc
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    avatar: 'https://qph.cf2.poecdn.net/main-thumb-pb-3004-50-jougqzjtwfqfyqprxbdwofvnwattmtrg.jpeg',
    createdAt: '2024-07-03',
    updatedAt: '2024-07-03'
  }
]

export const messages: MessageProps[] = [
  { id: 1, content: '问题1', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'question', conversationId: 1 },
  { id: 2, content: '回答1', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'answer', conversationId: 1 },
  { id: 3, content: '问题2', createdAt: '2024-07-03',updatedAt: '2024-07-03',  type: 'question', conversationId: 1 },
  { id: 4, content: '回答2', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'answer', conversationId: 1 },
  { id: 5, content: '问题3', createdAt: '2024-07-03', type: 'question', updatedAt: '2024-07-03', conversationId: 1 },
  { id: 6, content: '', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'answer', status: 'loading', conversationId: 1 },
  { id: 7, content: '问题11', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'question', conversationId: 2 },
  { id: 8, content: '回答11', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'answer', conversationId: 2 },
  { id: 9, content: '问题22', createdAt: '2024-07-03',updatedAt: '2024-07-03',  type: 'question', conversationId: 2 },
  { id: 10, content: '回答22', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'answer', conversationId: 2 },
  { id: 11, content: '问题33', createdAt: '2024-07-03', type: 'question', updatedAt: '2024-07-03', conversationId: 2 },
  { id: 12, content: '', createdAt: '2024-07-03', updatedAt: '2024-07-03', type: 'answer', status: 'loading', conversationId: 2 },
]

export const conversations: ConversationProps[] = [
  { id: 1, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘1', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
  { id: 2, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘2', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
  { id: 3, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘3', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
  { id: 4, selectedModel: 'GPT-3.5-Turbo', title: '你是一只猫娘4', createdAt: '2025-3-31', updatedAt: '2025-3-31', providerId: 1 },
]
