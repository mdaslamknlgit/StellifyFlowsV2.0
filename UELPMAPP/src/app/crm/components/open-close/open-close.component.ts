import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
@Component({
  selector: 'app-open-close',
  templateUrl: './open-close.component.html',
  styleUrls: ['./open-close.component.css'],
  animations: [
    trigger(
      'myAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)',opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', 'opacity': 1}),
          animate( '500ms', style({transform: 'translateX(100%)', opacity: 0})),
        ])
      ]
    )
  ]
  // animations: [
  //   trigger('openClose', [
  //     // ...
  //     state('open', style({
  //       height: '200px',
  //       opacity: 1,
  //       backgroundColor: 'yellow'
  //     })),
  //     state('closed', style({
  //       height: '10px',
  //       opacity: 0.8,
  //       backgroundColor: 'blue'
  //     })),
  //     transition('open => closed', [
  //       animate('1s')
  //     ]),
  //     transition('closed => open', [
  //       animate('0.5s')
  //     ]),
  //   ]),
  // ]
})
export class OpenCloseComponent implements OnInit {

  constructor() { }
  isOpen = true;
  show:boolean = false;
  ngOnInit() {
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }

  toggle1(e)
  {
    this.show = !this.show;
  }
}
