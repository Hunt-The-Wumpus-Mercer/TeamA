export type QuestionType = "MCQ" | "FRQ"
export interface Question {
    id: number;
    type: QuestionType;
    prompt: string;
    options?: string[]; //MCQ answer choices
    answer: string;
    hint?: string;
}
export interface ITrivia {
  questions: Question[];
  getNextQuestion(): Question;
  validateAnswer(questionId: number, userAnswer: string): boolean;
}