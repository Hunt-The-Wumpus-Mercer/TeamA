import "../shared/UIStyleHadrian.css";
import type { IHighScores } from "./IHighScores";
import type { HighScore } from "./HighScores";

type ScoreSource = Pick<HighScore, "getScores">;
type SubmitHandler = (playerName: string) => void;
type NameSlot = { letter: string; selected: boolean };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export class HighScoreGraphics {
    private $container!: JQuery<HTMLElement>;
    private scoreRows!: HTMLElement;
    private entrySection!: HTMLElement;
    private pendingScore!: HTMLElement;
    private submitButton!: HTMLButtonElement;
    private closeButton!: HTMLButtonElement;
    private nameSlotsContainer!: HTMLElement;
    private nameSlotsState: NameSlot[] = [
        { letter: "A", selected: true },
        { letter: "A", selected: false },
        { letter: "A", selected: false },
    ];
    private selectedSlotIndex = 0;
    private isEntryOpen = false;
    private onSubmit?: SubmitHandler;
    private onClose?: () => void;
    nameSlots: any;

    public init($container: JQuery<HTMLElement>): void {
        this.$container = $container;
        this.$container.empty();

        const shell = document.createElement("section");
        shell.className = "ui-shell";
        shell.dataset.role = "high-score-overlay";

        const panel = document.createElement("div");
        panel.className = "ui-panel";

        const header = document.createElement("header");
        header.className = "ui-header";

        const headerCopy = document.createElement("div");
        const kicker = document.createElement("p");
        kicker.className = "ui-kicker";
        kicker.textContent = "Hunt the Wumpus";
        const title = document.createElement("h2");
        title.className = "ui-title";
        title.textContent = "High Scores";
        const copy = document.createElement("p");
        copy.className = "ui-copy";
        copy.textContent = "Arcade hall of fame";
        headerCopy.append(kicker, title, copy);

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "ui-button";
        closeButton.dataset.role = "close-high-scores";
        closeButton.textContent = "Close";
        header.append(headerCopy, closeButton);

        const scoreRows = document.createElement("div");
        scoreRows.className = "ui-board";
        scoreRows.dataset.slot = "score-rows";

        const entrySection = document.createElement("section");
        entrySection.className = "ui-entry";
        entrySection.dataset.slot = "entry-section";

        const scoreLine = document.createElement("div");
        scoreLine.className = "ui-scoreline";

        const hint = document.createElement("p");
        hint.className = "ui-hint";
        hint.textContent = "Enter your initials using the arrows below";

        const scoreHint = document.createElement("p");
        scoreHint.className = "ui-hint";
        scoreHint.append("Score: ");

        const pendingScore = document.createElement("span");
        pendingScore.dataset.slot = "pending-score";
        pendingScore.textContent = "0";
        scoreHint.append(pendingScore);

        scoreLine.append(hint, scoreHint);

        const slotRow = document.createElement("div");
        slotRow.className = "ui-slot-row";

        const nameSlots = document.createElement("div");
        nameSlots.className = "ui-slot-grid";
        nameSlots.dataset.slot = "name-slots";

        const submitButton = document.createElement("button");
        submitButton.type = "button";
        submitButton.className = "ui-button";
        submitButton.dataset.role = "submit-high-score";
        submitButton.textContent = "Save Score";

        slotRow.append(nameSlots, submitButton);
        entrySection.append(scoreLine, slotRow);
        panel.append(header, scoreRows, entrySection);
        shell.append(panel);
        this.$container.append(shell);

        this.scoreRows = scoreRows;
        this.entrySection = entrySection;
        this.pendingScore = pendingScore;
        this.submitButton = submitButton;
        this.closeButton = closeButton;
        this.nameSlotsContainer = nameSlots;

        this.closeButton.addEventListener("click", () => this.close());
        this.submitButton.addEventListener("click", () => this.submitName());

        window.addEventListener("keydown", this.onWindowKeyDown);

        this.$container.hide();
        this.renderNameSlots();
    }

    public show(highScores: ScoreSource, playerName = "", playerScore?: number, onSubmit?: SubmitHandler, onClose?: () => void): void {
        this.showHighScores(highScores, playerName, playerScore, onSubmit, onClose);
    }

    public showHighScores(highScores: ScoreSource, playerName = "", playerScore?: number, onSubmit?: SubmitHandler, onClose?: () => void): void {
        this.onSubmit = onSubmit;
        this.onClose = onClose;

        this.renderScoreRows(highScores.getScores());

        const isEntryVisible = typeof playerScore === "number";
        this.isEntryOpen = isEntryVisible;
        this.entrySection.style.display = isEntryVisible ? "" : "none";
        this.pendingScore.textContent = typeof playerScore === "number" ? playerScore.toString() : "0";

        if (isEntryVisible) {
            this.prefillName(playerName);
        } else {
            this.resetNameSlots();
        }

        this.renderNameSlots();
        this.$container.show();
    }

    public close(): void {
        this.isEntryOpen = false;
        this.$container.hide();
        this.resetNameSlots();

        if (this.onClose) {
            this.onClose();
            this.onClose = undefined;
        }
    }

    private onWindowKeyDown = (event: KeyboardEvent): void => {
        if (!this.isEntryOpen) return;

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            this.selectSlot(this.selectedSlotIndex - 1);
            this.renderNameSlots();
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            this.selectSlot(this.selectedSlotIndex + 1);
            this.renderNameSlots();
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            this.rotateSlot(this.selectedSlotIndex, -1);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.rotateSlot(this.selectedSlotIndex, 1);
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            this.submitName();
        }
    };

    private renderScoreRows(scores: IHighScores[]): void {
        const rows = this.getSortedScores(scores).slice(0, 10);

        while (rows.length < 10) {
            rows.push({
                playerName: "EMPTY",
                caveName: "Unknown Cave",
                score: 0,
                moves: 0,
                arrowsLeft: 0,
                gold: 0,
            });
        }

        this.scoreRows.replaceChildren();

        rows.forEach((score, index) => {
            const isEmpty = score.playerName === "EMPTY";
            const row = document.createElement("div");
            row.className = `ui-row ${isEmpty ? "is-empty" : ""}`;

            const rank = document.createElement("div");
            rank.className = "ui-rank";
            rank.textContent = String(index + 1).padStart(2, "0");

            const main = document.createElement("div");
            main.className = "ui-main";

            const name = document.createElement("div");
            name.className = "ui-name";
            name.textContent = score.playerName;

            const cave = document.createElement("div");
            cave.className = "ui-cave";
            cave.textContent = score.caveName || "Unknown Cave";

            main.append(name, cave);

            const stats = document.createElement("div");
            stats.className = "ui-stats";

            stats.append(
                this.createStat("Score", isEmpty ? "EMPTY" : score.score.toString()),
                this.createStat("Moves", score.moves.toString()),
                this.createStat("Arrows", score.arrowsLeft.toString()),
                this.createStat("Gold", score.gold.toString())
            );

            row.append(rank, main, stats);
            this.scoreRows.append(row);
        });
    }

    private getSortedScores(scores: IHighScores[]): IHighScores[] {
        return [...scores].sort((a, b) => b.score - a.score);
    }

    private prefillName(playerName: string): void {
        const letters = playerName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3).split("");

        this.nameSlotsState = this.nameSlotsState.map((slot, index) => ({
            ...slot,
            letter: letters[index] || "A",
        }));
        this.selectedSlotIndex = 0;
        this.markSelectedSlot();
    }

    private resetNameSlots(): void {
        this.nameSlotsState = [
            { letter: "A", selected: true },
            { letter: "A", selected: false },
            { letter: "A", selected: false },
        ];
        this.selectedSlotIndex = 0;
        this.renderNameSlots();
    }

    private renderNameSlots(): void {
        this.nameSlotsContainer.replaceChildren();

        this.nameSlotsState.forEach((slot, index) => {
            const slotElement = document.createElement("div");
            slotElement.className = `ui-slot ${slot.selected ? "is-selected" : ""}`;
            slotElement.dataset.slotIndex = index.toString();
            slotElement.dataset.role = "slot-select";

            const upButton = document.createElement("button");
            upButton.type = "button";
            upButton.className = "ui-arrow-button";
            upButton.dataset.role = "slot-up";
            upButton.dataset.slotIndex = index.toString();
            upButton.setAttribute("aria-label", `Decrease initial ${index + 1}`);
            upButton.textContent = "▲";
            upButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.rotateSlot(index, -1);
            });

            const letter = document.createElement("div");
            letter.className = "ui-letter";
            letter.textContent = slot.letter;

            const downButton = document.createElement("button");
            downButton.type = "button";
            downButton.className = "ui-arrow-button";
            downButton.dataset.role = "slot-down";
            downButton.dataset.slotIndex = index.toString();
            downButton.setAttribute("aria-label", `Increase initial ${index + 1}`);
            downButton.textContent = "▼";
            downButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.rotateSlot(index, 1);
            });

            const label = document.createElement("p");
            label.className = `ui-label ${slot.selected ? "is-active" : ""}`;
            label.textContent = `Slot ${index + 1}`;

            slotElement.addEventListener("click", () => this.selectSlot(index));
            slotElement.append(upButton, letter, downButton, label);
            this.nameSlotsContainer.append(slotElement);
        });
    }

    private selectSlot(slotIndex: number): void {
        this.selectedSlotIndex = this.clampSlotIndex(slotIndex);
        this.markSelectedSlot();
    }

    private rotateSlot(slotIndex: number, direction: 1 | -1): void {
        const normalizedIndex = this.clampSlotIndex(slotIndex);
        const currentLetter = this.nameSlots[normalizedIndex].letter;
        const currentIndex = ALPHABET.indexOf(currentLetter);
        const nextIndex = (currentIndex + direction + ALPHABET.length) % ALPHABET.length;

        this.nameSlots[normalizedIndex].letter = ALPHABET[nextIndex];
        this.selectedSlotIndex = normalizedIndex;
        this.markSelectedSlot();
        this.renderNameSlots();
    }

    private markSelectedSlot(): void {
        this.nameSlotsState = this.nameSlotsState.map((slot, index) => ({
            ...slot,
            selected: index === this.selectedSlotIndex,
        }));
    }

    private clampSlotIndex(slotIndex: number): number {
        return Math.max(0, Math.min(this.nameSlotsState.length - 1, slotIndex));
    }

    private submitName(): void {
        const playerName = this.collectName();

        if (this.onSubmit) {
            this.onSubmit(playerName);
        }

        this.close();
    }

    private collectName(): string {
        const name = this.nameSlotsState.map((slot) => slot.letter).join("");

        return name || "AAA";
    }

    private createStat(label: string, value: string): HTMLElement {
        const stat = document.createElement("div");
        stat.className = "ui-stat";

        const statLabel = document.createElement("span");
        statLabel.className = "ui-stat-label";
        statLabel.textContent = label;

        const statValue = document.createElement("span");
        statValue.className = "ui-stat-value";
        statValue.textContent = value;

        stat.append(statLabel, statValue);
        return stat;
    }
}