export interface IFaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export interface IUpdateFaqsPayload {
  faqs: {
    question: string;
    answer: string;
    isActive: boolean;
  }[];
}
