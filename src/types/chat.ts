export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

export type ChatState = {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
}

export type MessageBubbleProps = {
  message: Message;
  onCopy?: () => void;
}

export type MessageHistoryProps = {
  messages: Message[];
  isTyping?: boolean;
  isLoading?: boolean;
}

export type MessageInputProps = {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export type TypingIndicatorProps = {
  isVisible: boolean;
  message?: string;
}