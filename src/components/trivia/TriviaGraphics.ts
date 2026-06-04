import { Trivia } from './Trivia';
import type { EventType, Question } from './ITrivia';

type OptionRect = { text: string; x: number; y: number; w: number; h: number };

export class TriviaGraphics {
	private $container!: JQuery;
	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D;
	private titleNode!: HTMLHeadingElement;
	private copyNode!: HTMLParagraphElement;
	private trivia: Trivia = new Trivia();
	private activeResolve?: (value: string) => void;
	private activeReject?: (reason?: any) => void;
	private optionsRects: OptionRect[] = [];
	private inputText: string = '';
	private listeningKeys = false;
	private currentQuestion?: Question;
	private isChallengeActive = false;
	private prevOverflow = '';
	private prevScrollY = 0;
	private hiddenSiblingDisplays: Array<{ el: HTMLElement; display: string }> = [];

	public init($container: JQuery): void {
		this.$container = $container;
		this.$container.hide();

		this.canvas = document.createElement('canvas');
		this.canvas.width = Math.max(640, Math.min(900, window.innerWidth - 40));
		this.canvas.height = 320;
		this.canvas.style.width = this.canvas.width + 'px';
		this.canvas.style.height = this.canvas.height + 'px';
		this.canvas.className = 'ui-canvas';
		this.canvas.tabIndex = 0; // make focusable for keyboard

		this.$container.empty();

		const shell = document.createElement('section');
		shell.className = 'ui-shell';

		const panel = document.createElement('div');
		panel.className = 'ui-panel';

		const header = document.createElement('header');
		header.className = 'ui-header';

		const headerCopy = document.createElement('div');
		const kicker = document.createElement('p');
		kicker.className = 'ui-kicker';
		kicker.textContent = 'Trivia Cabinet';
		const title = document.createElement('h2');
		title.className = 'ui-title';
		title.textContent = 'Question Screen';
		const copy = document.createElement('p');
		copy.className = 'ui-copy';
		copy.textContent = 'Answer fast before the timer runs out';
		this.titleNode = title;
		this.copyNode = copy;
		headerCopy.append(kicker, title, copy);
		header.append(headerCopy);

		const canvasFrame = document.createElement('div');
		canvasFrame.className = 'ui-canvas-frame';
		canvasFrame.append(this.canvas);

		panel.append(header, canvasFrame);
		shell.append(panel);
		this.$container.append(shell);
		const ctx = this.canvas.getContext('2d');
		if (!ctx) throw new Error('Error: 263472379 - Failed to get canvas context'); //error if you dont have canvas
		this.ctx = ctx;
		this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
	}

	public showQuestion(question: Question): Promise<string> {
		if (!this.$container || !this.canvas) throw new Error('Error: 268746183 - TriviaGraphics not initialized'); //error if you forgor to init
		this.currentQuestion = question;
		this.optionsRects = [];
		this.inputText = '';

		this.$container.show();
		this.canvas.focus();

		this.render();

		return new Promise<string>((resolve, reject) => {
			this.activeResolve = (val: string) => {
				if (!this.isChallengeActive) this.cleanup();
				resolve(val);
			};
			this.activeReject = (err?: any) => {
				if (!this.isChallengeActive) this.cleanup();
				reject(err);
			};

			if (question.type === 'FRQ') this.startKeyListening();
		});
	}

	public async showQuestions(eventType: EventType): Promise<boolean> {
		this.setChallengeCopy(eventType);
		this.beginChallengeView();

		try {
			switch (eventType) {
				case 'PIT':
					return await this.trivia.saveFromPit((question) => this.showQuestion(question));
				case 'SECRET':
					return await this.trivia.purchaseSecret((question) => this.showQuestion(question));
				case 'WUMPUS':
					return await this.trivia.escapeWumpus((question) => this.showQuestion(question));
				case 'ARROWS':
					return await this.trivia.purchaseArrows((question) => this.showQuestion(question));
				default:
					return false;
			}
		} finally {
			this.endChallengeView();
			this.cleanup();
		}
	}

	public cancelActive(): void {
		if (this.activeReject) this.activeReject(new Error('Cancelled'));
		this.cleanup();
	}

	private cleanup(): void {
		this.stopKeyListening();
		this.$container.hide();
		this.activeResolve = undefined;
		this.activeReject = undefined;
		this.optionsRects = [];
		this.inputText = '';
		this.currentQuestion = undefined;
		this.clearCanvas();
	}

	private beginChallengeView(): void {
		this.isChallengeActive = true;
		try {
			this.prevOverflow = document.documentElement.style.overflow || '';
			this.prevScrollY = window.scrollY || window.pageYOffset || 0;
			const $root = this.$container.parent();
			if ($root.length) {
				this.hiddenSiblingDisplays = [];
				$root.children().not(this.$container).each((_, node) => {
					const el = node as HTMLElement;
					const display = el.style.display;
					this.hiddenSiblingDisplays.push({ el, display });
					el.style.display = 'none';
				});
			}
			this.$container.show();
			const off = this.$container.offset();
			window.scrollTo({ top: off ? off.top : 0, behavior: 'smooth' });
			document.documentElement.style.overflow = 'hidden';
		} catch (e) {
			// no-op
		}
	}

	private endChallengeView(): void {
		this.isChallengeActive = false;
		try {
			for (const entry of this.hiddenSiblingDisplays) {
				entry.el.style.display = entry.display;
			}
			this.hiddenSiblingDisplays = [];
			document.documentElement.style.overflow = this.prevOverflow;
			window.scrollTo(0, this.prevScrollY);
		} catch (e) {
			// no-op
		}
	}

	private setChallengeCopy(eventType: EventType): void {
		if (!this.titleNode || !this.copyNode) return;

		switch (eventType) {
			case 'PIT':
				this.titleNode.textContent = 'Pit Escape';
				this.copyNode.textContent = 'Answer trivia to climb back out.';
				return;
			case 'SECRET':
				this.titleNode.textContent = 'Secret Purchase';
				this.copyNode.textContent = 'Answer trivia to unlock the secret.';
				return;
			case 'WUMPUS':
				this.titleNode.textContent = 'Wumpus Finale';
				this.copyNode.textContent = 'Answer trivia to survive the encounter.';
				return;
			case 'ARROWS':
				this.titleNode.textContent = 'Arrow Purchase';
				this.copyNode.textContent = 'Answer trivia to restock arrows.';
				return;
		}
	}

	private onCanvasClick(e: MouseEvent): void {
		if (!this.currentQuestion) return;
		const rect = this.canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
		const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

		// check mcq option hit
		for (const opt of this.optionsRects) {
			if (x >= opt.x && x <= opt.x + opt.w && y >= opt.y && y <= opt.y + opt.h) {
				if (this.activeResolve) this.activeResolve(opt.text);
				return;
			}
		}

		// If frq capture keyboard
		if (this.currentQuestion.type === 'FRQ') {
			this.canvas.focus();
		}
	}

	private onKeyDown(e: KeyboardEvent): void {
		if (!this.currentQuestion || this.currentQuestion.type !== 'FRQ') return;
		if (!this.listeningKeys) return;
		if (e.key === 'Enter') {
			e.preventDefault();
			if (this.activeResolve) this.activeResolve(this.inputText);
			return;
		}
		if (e.key === 'Backspace') {
			this.inputText = this.inputText.slice(0, -1);
			this.render();
			return;
		}
		if (e.key.length === 1) {
			this.inputText += e.key;
			this.render();
		}
	}

	private startKeyListening(): void {
		if (this.listeningKeys) return;
		this.listeningKeys = true;
		window.addEventListener('keydown', this.windowKeyHandler);
	}

	private stopKeyListening(): void {
		if (!this.listeningKeys) return;
		this.listeningKeys = false;
		window.removeEventListener('keydown', this.windowKeyHandler);
	}

	private windowKeyHandler = (e: KeyboardEvent) => this.onKeyDown(e);

	private clearCanvas(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private render(): void {
		if (!this.currentQuestion) return;
		const ctx = this.ctx;
		const w = this.canvas.width;
		const h = this.canvas.height;

		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = '#0b63b7';
		ctx.lineWidth = 2;
		ctx.strokeRect(6, 6, w - 12, h - 12);

		// draws prompt
		ctx.fillStyle = '#ffffff';
		ctx.font = '18px "Courier New", monospace';
		const padding = 16;
		const maxTextWidth = w - padding * 2;
		this.wrapText(ctx, this.currentQuestion.prompt, padding, padding + 4, maxTextWidth, 22);

		if (this.currentQuestion.type === 'MCQ' && this.currentQuestion.options) {
			//show options
			const opts = this.currentQuestion.options;
			const btnW = Math.max(520, maxTextWidth);
			const btnH = 40;
			const startY = 90;
			const gap = 12;
			this.optionsRects = [];
			for (let i = 0; i < opts.length; i++) {
				const x = (w - btnW) / 2;
				const y = startY + i * (btnH + gap);
				// button background
				ctx.fillStyle = '#1f2937';
				ctx.fillRect(x, y, btnW, btnH);
				ctx.strokeStyle = '#0b63b7';
				ctx.strokeRect(x, y, btnW, btnH);
				// text
				ctx.fillStyle = '#ffffff';
				ctx.font = '16px "Courier New", monospace';
				this.drawTextCentered(ctx, opts[i], x, y, btnW, btnH);
				this.optionsRects.push({ text: opts[i], x, y, w: btnW, h: btnH });
			}
		} else {
			// Is frq show input box
			ctx.fillStyle = '#111215';
			const boxX = 40;
			const boxY = 120;
			const boxW = w - 80;
			const boxH = 48;
			ctx.fillRect(boxX, boxY, boxW, boxH);
			ctx.strokeStyle = '#0b63b7';
			ctx.strokeRect(boxX, boxY, boxW, boxH);

			ctx.fillStyle = '#ffffff';
			ctx.font = '18px "Courier New", monospace';
			const display = this.inputText + (Date.now() % 1000 < 500 ? '|' : '');
			ctx.fillText(display, boxX + 8, boxY + 32);

			// small hint
			ctx.fillStyle = '#c62828';
			ctx.font = '12px "Courier New", monospace';
			ctx.fillText('Type your answer and press Enter', boxX, boxY + boxH + 20);
		}
	}
	private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
		const words = text.split(' ');
		let line = '';
		for (let n = 0; n < words.length; n++) {
			const testLine = line + words[n] + ' ';
			const metrics = ctx.measureText(testLine);
			const testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				ctx.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, x, y);
	}
	private drawTextCentered(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, h: number) {
		const metrics = ctx.measureText(text);
		const textHeight = 16; // approx
		const tx = x + (w - metrics.width) / 2;
		const ty = y + (h + textHeight) / 2 - 6;
		ctx.fillText(text, tx, ty);
	}
}
