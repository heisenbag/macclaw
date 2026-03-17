import { Operator } from '@main/store/types';

export interface RouterState {
  operator: Operator;
  sessionId: string;
  initialPrompt?: string;
  isFree?: boolean;
  from: 'home' | 'new' | 'history';
}
