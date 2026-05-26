import type { Question, ITrivia } from "./ITrivia";
import Questions from "./Questions.json";

export class Trivia implements ITrivia {
    //creates question array
    public questions: Question[] = Questions as Question[];
    private randomList: Question[] = [];
    private index: number = 0;
    //Resets question list
    constructor() {
        this.resetQueue();
    }


    public resetQueue(): void {
        this.randomList = [...this.questions];
        this.index = 0;

        //randomises the questions
        for (let i = this.randomList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.randomList[i], this.randomList[j]] = 
            [this.randomList[j], this.randomList[i]];
        }
    } 
    public getNextQuestion(): Question {
        if (this.randomList.length === 0) {
          throw new Error("JSON is empty");
        }

        if (this.index >= this.randomList.length) {
            //resets if all questions used
            this.resetQueue();
        }

        const question = this.randomList[this.index];
        this.index++;
        return question;
      }

    public validateAnswer(questionId: number, userAnswer: string): boolean {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return false;
    
        return userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    }
}
