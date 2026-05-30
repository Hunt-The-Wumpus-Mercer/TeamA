export type TerminalLine = {
	text: string;
	kind: "text" | "info" | "warn";
	timestamp: Date;
};

export type TerminalListener = (lines: readonly TerminalLine[]) => void;

export class Terminal {
	private lines: TerminalLine[] = [];
	private listeners = new Set<TerminalListener>();
	private maxLines: number;
	private containerEl: HTMLElement | null = null;
	private scrollOnUpdate = true;

	constructor(maxLines = 500) {
		this.maxLines = Math.max(1, maxLines);
	}

	// creates the terminal element
	mount(container?: HTMLElement | string): HTMLElement | null {
		if (typeof document === "undefined") return null;
		let parent: HTMLElement | null = null;
		if (typeof container === "string") parent = document.querySelector(container);
		else if (container instanceof HTMLElement) parent = container;
		if (!parent) parent = document.body;

		const el = document.createElement("div");
		el.className = "terminal-widget";
		el.style.background = "white";
		el.style.color = "black";
		el.style.fontFamily = "monospace, monospace";
		el.style.padding = "8px";
		el.style.border = "1px solid #ccc";
		el.style.borderRadius = "4px";
		el.style.maxHeight = "50vh";
		el.style.overflow = "auto";
		el.style.whiteSpace = "pre-wrap";
		el.style.fontSize = "13px";

		parent.appendChild(el);
		this.containerEl = el;
		this.renderToContainer();
		return el;
	}

	subscribe(listener: TerminalListener): () => void {
		this.listeners.add(listener);
		listener(this.getLines());
		return () => this.listeners.delete(listener);
	}

	getLines(): readonly TerminalLine[] {
		return this.lines;
	}

	getText(): string {
		return this.lines.map((line) => line.text).join("\n");
	}

	clear(): void {
		this.lines = [];
		this.emit();
	}

	print(...parts: Array<string | number | boolean | null | undefined>): void {
		this.push(parts.map(String).join(""), "text");
	}

	println(...parts: Array<string | number | boolean | null | undefined>): void {
		this.push(parts.map(String).join(""), "text");
	}

	printf(format: string, ...args: Array<string | number | boolean | null | undefined>): void {
		let index = 0;
		const text = format.replace(/%[sdifjo%]/g, (match) => {
			if (match === "%%") return "%";
			const value = args[index++];
			switch (match) {
				case "%s":
					return String(value);
				case "%d":
				case "%i":
					return Number.parseInt(String(value), 10).toString();
				case "%f":
					return Number.parseFloat(String(value)).toString();
				case "%j":
				case "%o":
					try {
						return JSON.stringify(value);
					} catch {
						return String(value);
					}
				default:
					return match;
			}
		});
		this.push(text, "text");
	}

	info(...parts: Array<string | number | boolean | null | undefined>): void {
		this.push(parts.map(String).join(""), "info");
	}

	warn(...parts: Array<string | number | boolean | null | undefined>): void {
		this.push(parts.map(String).join(""), "warn");
	}

	separator(title = ""): void {
		const label = title ? `--- ${title} ---` : "--------------------";
		this.push(label, "text");
	}

	table(rows: Record<string, unknown>[]): void {
		if (!rows.length) {
			this.push("(empty)", "text");
			return;
		}

		const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
		this.push(keys.join(" | "), "text");
		this.push(keys.map(() => "---").join(" | "), "text");
		for (const row of rows) {
			this.push(keys.map((key) => String(row[key] ?? "")).join(" | "), "text");
		}
	}

	private push(text: string, kind: TerminalLine["kind"]): void {
		this.lines.push({ text, kind, timestamp: new Date() });
		if (this.lines.length > this.maxLines) {
			this.lines.splice(0, this.lines.length - this.maxLines);
		}
		this.emit();
		this.renderToContainer();
	}

	private emit(): void {
		const snapshot = this.getLines();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
    //renders
	private renderToContainer(): void {
		if (!this.containerEl) return;
		this.containerEl.innerHTML = "";
		for (const line of this.lines) {
			const div = document.createElement("div");
			div.textContent = line.text;
			switch (line.kind) {
				case "info":
					div.style.color = "#0b6";
					break;
				case "warn":
					div.style.color = "#b60";
					break;
				default:
					div.style.color = "black";
			}
			this.containerEl.appendChild(div);
		}
		if (this.scrollOnUpdate) this.containerEl.scrollTop = this.containerEl.scrollHeight;
	}
}

export const terminal = new Terminal();

export default terminal;
