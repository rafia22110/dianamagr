export interface Workshop {
  id: string;
  title: string;
  description?: string;
  date?: string;
  price: number;
  is_online: boolean;
  image_url?: string;
  status: 'open' | 'closed' | 'finished';
}

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  price?: number;
}

export interface Registration {
  id: string;
  workshop_id?: string;
  lecture_id?: string;
  full_name: string;
  email: string;
  phone: string;
  message?: string;
  created_at?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at?: string;
}

export interface Order {
  id: string;
  item_type: 'book' | 'workshop';
  item_id?: string;
  full_name: string;
  email: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_id?: string;
  created_at?: string;
}
