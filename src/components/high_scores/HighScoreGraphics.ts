import type { HighScoreData } from "./IHighScores";
import type { HighScore } from "./HighScores";

type ScoreSource = Pick<HighScore, "getScores">;
type SubmitHandler = (playerName: string) => void;

export class HighScoreGraphics {
    private $container!: JQuery<HTMLElement>;
    private scoreRows!: HTMLElement;

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
        headerCopy.append(kicker, title, copy);

        header.append(headerCopy);

        const scoreRows = document.createElement("div");
        scoreRows.className = "ui-board";
        scoreRows.dataset.slot = "score-rows";

        panel.append(header, scoreRows);
        shell.append(panel);
        this.$container.append(shell);

        this.scoreRows = scoreRows;

        this.$container.hide();
    }

    public show(highScores: ScoreSource, playerName = "", playerScore?: number, onSubmit?: SubmitHandler, onClose?: () => void): void {
        this.showHighScores(highScores, playerName, playerScore, onSubmit, onClose);
    }

    public showHighScores(highScores: ScoreSource, _playerName = "", _playerScore?: number, _onSubmit?: SubmitHandler, _onClose?: () => void): void {
        void _playerName;
        void _playerScore;
        void _onSubmit;
        void _onClose;
        this.renderScoreRows(highScores.getScores());

        this.$container.show();
    }

    public close(): void {
        this.$container.hide();
    }


    private renderScoreRows(scores: HighScoreData[]): void {
        const rows = this.getSortedScores(scores).slice(0, 10);

        while (rows.length < 10) {
            rows.push({
                playerName: "EMPTY",
                caveName: "Unknown Cave",
                score: 0,
                turns: 0,
                arrowsLeft: 0,
                coins: 0,
            });
        }

        this.scoreRows.replaceChildren();

        const table = document.createElement("table");
        table.className = "ui-score-table";
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";

        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        ["#", "Name", "Cave", "Score", "Moves", "Arrows", "Gold"].forEach(label => {
            const th = document.createElement("th");
            th.textContent = label;
            th.style.textAlign = label === "Name" || label === "Cave" ? "left" : "center";
            th.style.padding = "4px 8px";
            th.style.borderBottom = "2px solid currentColor";
            headRow.append(th);
        });
        thead.append(headRow);
        table.append(thead);

        const tbody = document.createElement("tbody");
        rows.forEach((score, index) => {
            const isEmpty = score.playerName === "EMPTY";
            const tr = document.createElement("tr");
            tr.className = `ui-row ${isEmpty ? "is-empty" : ""}`.trim();

            const cells = [
                String(index + 1).padStart(2, "0"),
                score.playerName,
                score.caveName || "Unknown Cave",
                isEmpty ? "EMPTY" : score.score.toString(),
                score.turns.toString(),
                score.arrowsLeft.toString(),
                score.coins.toString(),
            ];

            cells.forEach((value, cellIndex) => {
                const td = document.createElement("td");
                td.textContent = value;
                td.style.textAlign = cellIndex === 1 || cellIndex === 2 ? "left" : "center";
                td.style.padding = "4px 8px";
                td.style.borderBottom = "1px solid currentColor";
                tr.append(td);
            });

            tbody.append(tr);
        });
        table.append(tbody);

        this.scoreRows.append(table);
    }

    private getSortedScores(scores: HighScoreData[]): HighScoreData[] {
        return [...scores].sort((a, b) => b.score - a.score);
    }
}