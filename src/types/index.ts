export type UserLevel = 'beginner' | 'homeowner' | 'technician';

export type Category =
  | 'Yoritish'
  | 'Rozetka'
  | 'Himoya'
  | 'Isitish'
  | 'Simlar'
  | 'Quvvat';

export interface Problem {
  id: string;
  title: string;
  summary: string;
  category: Category;
  /** Darhol xavf bo'lsa, avval xavfsizlik ko'rsatmasi ko'rsatiladi */
  emergency: boolean;
  description: string;
  possibleCauses: string[];
  warningSigns: string[];
  safeObservations: string[];
  nextSteps: string[];
  contactElectrician: string[];
}

export interface LearningTopicData {
  slug: string;
  title: string;
  level: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
  example: string;
  keyPoints: string[];
}

export interface KnowledgeEntry {
  id: string;
  term: string;
  category: 'Jihoz' | 'Komponent' | 'Asbob' | 'Simlar' | 'Himoya' | 'Nosozlik' | 'Atama';
  definition: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageName?: string;
  simulated?: boolean;
}
