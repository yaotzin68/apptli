import {Component, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.scss'],
})
export class SwipeComponent implements OnInit {
  @Input() text = 'Desliza a la izquierda para borrar.';
  show: any = localStorage.getItem('showInstructions') ? localStorage.getItem('showInstructions') : true;

  constructor() { }

  ngOnInit() {
    this.show = localStorage.getItem('showInstructions') ? localStorage.getItem('showInstructions') : true;
  }

  dontShow() {
    this.show = 'false';
    localStorage.setItem('showInstructions', this.show);
  }

}
