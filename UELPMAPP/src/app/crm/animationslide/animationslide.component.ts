import { Component, OnInit } from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-animationslide',
  templateUrl: './animationslide.component.html',
  styleUrls: ['./animationslide.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),//
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class AnimationslideComponent implements OnInit {

  toggle: boolean = true;
  
  constructor() {}
  
  toggleElement(){
     this.toggle=!this.toggle;
  }

  ngOnInit() {
  }

}
