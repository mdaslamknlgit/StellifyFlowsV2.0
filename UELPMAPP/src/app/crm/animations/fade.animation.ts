import { trigger, transition, style, animate, query } from '@angular/animations';

// fade.animation.ts
export const Fade = trigger('fade', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
    ]),
    transition(':leave', [animate('500ms', style({ opacity: 0 }))]),
]);