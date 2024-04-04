import { Component, OnInit } from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-animationfade',
  templateUrl: './animationfade.component.html',
  styleUrls: ['./animationfade.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition('void => *', [
        style({opacity:0}), //style only for transition transition (after transiton it removes)
        animate(500, style({opacity:1})) // the new state of the transition(after transiton it removes)
      ]),
      transition('* => void', [
        animate(500, style({opacity:0})) // the new state of the transition(after transiton it removes)
      ])
    ])
  ]
})
export class Animationfadeomponent implements OnInit {
  toggle: boolean = true;
  constructor() { }
  toggleElement(){
    this.toggle=!this.toggle;
 }
  ngOnInit() {
  }

}
