
export interface Question {
  id: number;
  question_text: string;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
}

export interface OptionMap {
  question_id: number;
  A_group: string;
  B_group: string;
  C_group: string;
  D_group: string;
  E_group: string;
}

export interface Verse {
  ref: string;
  tr: string;
  note: string;
}

export interface GroupFeedback {
  group_id: string;
  title: string;
  summary: string;
  feedback_p1: string;
  feedback_p2: string;
  feedback_p3: string;
  feedback_p4: string;
  verses_json: string;
  hadith_set_key: string;
  outro: string;
}

export interface Hadith {
  item: string;
  note: string;
}

export interface HadithSet {
  set_key: string;
  item_1: string;
  note_1: string;
  item_2: string;
  note_2: string;
  item_3: string;
  note_3: string;
  item_4: string;
  note_4: string;
  item_5: string;
  note_5: string;
  item_6: string;
  note_6: string;
  item_7: string;
  note_7: string;
  item_8: string;
  note_8: string;
  item_9: string;
  note_9: string;
  item_10: string;
  note_10: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface SourcePerGroup {
  group_id: string;
  src1_title: string;
  src1_url: string;
  src2_title: string;
  src2_url: string;
  src3_title: string;
  src3_url: string;
  src4_title: string;
  src4_url: string;
}

export interface QuizData {
  questions: Question[];
  option_map: OptionMap[];
  group_feedback: GroupFeedback[];
  hadith_sets: HadithSet[];
  sources_per_group: SourcePerGroup[];
}

export interface Answer {
  questionId: number;
  choice: 'A' | 'B' | 'C' | 'D' | 'E';
}

export type Scores = Record<string, number>;

export interface Result {
  scores: Scores;
  winnerGroup: string;
  feedback: Omit<GroupFeedback, 'verses_json' | 'hadith_set_key' | 'group_id'>;
  verses: Verse[];
  hadiths: Hadith[];
  sources: Source[];
}

export type AppStep = 'start' | 'quiz' | 'email' | 'results';