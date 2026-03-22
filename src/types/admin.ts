export interface Subscriber {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  subscribed_at?: string;
}

export interface LinkRecord {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  type?: string;
  display_order?: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  created_at?: string;
}

export type MsgHelper = (type: "success" | "error", text: string) => void;
