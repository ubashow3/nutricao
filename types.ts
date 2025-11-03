
export enum AppState {
  Home,
  Questionnaire,
  Analyzing,
  Results,
  Registration,
  Confirmation,
}

export interface Question {
  id: string;
  text: string;
  type: 'radio' | 'text' | 'textarea';
  options?: string[];
}

export type Answers = {
  [key: string]: string;
};

export interface UserData {
    name: string;
    email: string;
    phone: string;
}
