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

   //allows for easier use of some functions later on
    public async runTriviaChallenge(
        numQuestions: number,
        requiredCorrect: number,
        promptFn?: (q: Question) => Promise<string>
    ): Promise<boolean> {
        if (!promptFn) throw new Error("promptFn is required to ask questions");

        let correct = 0;
        for (let i = 0; i < numQuestions; i++) {
            const q = this.getNextQuestion();
            const userAnswer = await promptFn(q);
            if (this.validateAnswer(q.id, userAnswer)) correct++;
        }

        return correct >= requiredCorrect;
    }

    // Purchasing additional arrows: 2 out of 3 correct
    public purchaseArrows(promptFn?: (q: Question) => Promise<string>): Promise<boolean> {
        return this.runTriviaChallenge(3, 2, promptFn);
    }

    // Purchasing a secret: 2 out of 3 correct
    public purchaseSecret(promptFn?: (q: Question) => Promise<string>): Promise<boolean> {
        return this.runTriviaChallenge(3, 2, promptFn);
    }

    // Saving from a bottomless pit: 2 out of 3 correct
    public saveFromPit(promptFn?: (q: Question) => Promise<string>): Promise<boolean> {
        return this.runTriviaChallenge(3, 2, promptFn);
    }

    // Escaping the Wumpus: 3 out of 5 correct
    public escapeWumpus(promptFn?: (q: Question) => Promise<string>): Promise<boolean> {
        return this.runTriviaChallenge(5, 3, promptFn);
    }
}
