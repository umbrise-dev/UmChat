export interface ConversationProps {
  id: number;
  title: string;
  selectedModel: string;
  createdAt: string;
  updatedAt: string;
  providerId: number;
}

export interface ProviderProps {
  id: number;
  name: string;
  title?: string;
  desc?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  models: string[];
}

export type MessageStatus = 'loading' | 'streaming' | 'finished';
export interface MessageProps {
  id: number;
  content: string;
  type: 'question' | 'answer';
  conversationId: number;
  status?: MessageStatus;
  createdAt: string;
  updatedAt: string;
  imagePath?: string;
}

export interface CreateChatProps {
  messages: {
    role: string;
    content: string;
    imagePath?: string;
  }[];
  providerName: string;
  selectedModel: string;
  messageId: number;
}

export interface UpdateStreamData {
  messageId: number;
  data: {
    is_end: boolean;
    result: string;
  }
}

export type OnUpdatedCallback = (data: UpdateStreamData) => void;

export interface MessageListInstance {
  ref: HTMLDivElement;
}
