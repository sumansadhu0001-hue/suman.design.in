export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: string;
  details: string[];
  benefits: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  client: string;
  timeline: string;
  budget: string;
  tags: string[];
  challenge: string;
  solution: string;
  results: string[];
  stats?: { label: string; value: string }[];
  imageUrl?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  badge?: string;
  buttonText: string;
  packageType: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}
