import { trigger, transition, animate, style, query, state, group } from '@angular/animations';

export const fader =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 0,
          transform: 'scale(0) translateY(100%)'
        })
      ], { optional: true }),
      query(':enter', [
        animate('600ms ease', style({
          opacity: 1, transform: 'scale(1) translateY(0)'
        })),
      ], { optional: true })
    ])
  ]);

  export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
            'max-height': '500px', 'opacity': '1', 'visibility': 'visible'
        })),
        state('out', style({
            'max-height': '0px', 'opacity': '0', 'visibility': 'hidden'
        })),
        transition('in => out', [group([
            
            animate('700ms ease-in-out', style({
                'visibility': 'hidden'
            })),
          
            animate('600ms ease-in-out', style({
                'max-height': '0px'
            })),
              animate('400ms ease-in-out', style({
                'opacity': '0'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('1ms ease-in-out', style({
                'visibility': 'visible'
            })),
            animate('600ms ease-in-out', style({
                'max-height': '500px'
            })),
            animate('500ms ease-in-out', style({
                'opacity': '1'
            }))
        ]
        )])
    ]),
];