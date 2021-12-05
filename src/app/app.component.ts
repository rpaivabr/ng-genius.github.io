import { Component, ElementRef, ViewChild } from '@angular/core';
import { delay, first, interval, of, take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('red') red!: ElementRef;
  @ViewChild('green') green!: ElementRef;
  @ViewChild('yellow') yellow!: ElementRef;
  @ViewChild('blue') blue!: ElementRef;

  audioCtx = new AudioContext;
  title = 'Genius';
  message = 'Aperte start para jogar';
  game: 'stop' | 'start' | 'wait' = 'stop';
  level: number = 0;
  record: number = 0;
  gameInputs: string[] = [];
  userInputs: string[] = [];
  played: number = 0;

  startGame() {
    this.game = 'start';
    this.message = '';
    this.resetGame();
    this.nextLevel();
  }

  resetGame() {
    this.gameInputs = [];
    this.userInputs = [];
    this.level = 0;
    this.played = 0;
  }

  nextLevel() {
    this.game = 'wait';
    this.level++;
    if (this.level > this.record) {
      this.record++;
    }
    const nextPad = this.randomPad();
    this.gameInputs.push(nextPad);
    this.playGameInputs();
  }



  handleClick(pad: string) {
    console.log('handleClick');
    if (this.game !== 'start') return;
    this.beep(pad);
    this.userInputs.push(pad);
    if (this.gameInputs[this.played] !== this.userInputs[this.played]) {
      console.log('diferente');
      this.resetGame();
      this.message = 'Que pena! Não fique triste digdin';
      this.game = 'stop';
      return;
    }
    this.played++;
    if (this.gameInputs.length === this.userInputs.length) {
      this.gameTurn();
    }
  }

  handleMouseOver(pad: string) {
    if (this.game !== 'start') return;
    (<any>this)[pad].nativeElement.classList.add('hover');
  }

  handleMouseLeave(pad: string) {
    if (this.game !== 'start') return;
    (<any>this)[pad].nativeElement.classList.remove('hover');
  }

  handleMouseDown(pad: string) {
    if (this.game !== 'start') return;
    (<any>this)[pad].nativeElement.classList.remove('hover');
    (<any>this)[pad].nativeElement.classList.add('active');
  }

  handleMouseUp(pad: string) {
    if (this.game !== 'start') return;
    (<any>this)[pad].nativeElement.classList.add('hover');
    (<any>this)[pad].nativeElement.classList.remove('active');
  }

  private playGameInputs(): void {
    this.gameInputs
      .map((input, index) => of(input).pipe(first(), delay(800 * index)))
      .map(obs => obs.subscribe(
        pad => this.handleGameClick(pad))
      );
  }

  private handleGameClick(pad: string): void {
    (<any>this)[pad].nativeElement.classList.toggle('active');
    this.beep(pad);
    interval(500).pipe(take(1)).subscribe(async () => {
      (<any>this)[pad].nativeElement.classList.toggle('active');
    });
    this.played++;
    if (this.played === this.level) {
      this.userTurn();
    }
  }

  private gameTurn(): void {
    this.played = 0;
    this.userInputs = [];
    this.message = 'Acertô miseravi!';
    this.game = 'wait';
    interval(2000).pipe(first()).subscribe(() => {
      this.nextLevel();
      this.message = '';
    });
  }

  private userTurn(): void {
    this.game = 'start';
    this.played = 0;
  }

  private randomPad(): string { // min and max included 
    const number = Math.floor(Math.random() * (4 - 1 + 1) + 1);
    let pad = 'red';

    switch (number) {
      case 1: pad = 'red'; break;
      case 2: pad = 'green'; break;
      case 3: pad = 'yellow'; break;
      case 4: pad = 'blue'; break;
    }
    
    return pad;
  }

  private beep(key: string) {
    let frequency = 440;
    switch (key) {
      case 'red': frequency = 156.82; break;
      case 'green': frequency = 209.33; break;
      case 'yellow': frequency = 139.71; break;
      case 'blue': frequency = 104.66; break;
    }

    var oscillator = this.audioCtx.createOscillator();
    var gainNode = this.audioCtx.createGain();
  
    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
  
    gainNode.gain.value = 0.1;
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
  
    oscillator.start();

    interval(500).pipe(first()).subscribe(() => {
      oscillator.stop();
    });
  }
}
