import { AfterViewInit,Directive,ElementRef,HostListener,Renderer2 } from "@angular/core";
@Directive({
    selector: 'textarea[autoresize]'
})
export class AutoResize implements AfterViewInit
{
    private elementRef: HTMLElement;
    constructor(public element: ElementRef,private rendererObj:Renderer2) {
        this.elementRef = element.nativeElement;
    }
    ngAfterViewInit(): void {

        this.adjust();
    }
    @HostListener('input')
    onInput(): void {
      this.adjust();
    }

    adjust(): void {
        // perform height adjustments after input changes, if height is different
        if(this.elementRef!=undefined)
        {
            if (this.elementRef.style.height == this.elementRef.scrollHeight + 'px') {
                return;
            }
            this.rendererObj.setStyle(this.elementRef,"overflow","hidden");
            this.rendererObj.setStyle(this.elementRef,"height","auto");
            this.rendererObj.setStyle(this.elementRef,"height",this.elementRef.scrollHeight+"px");
        }
    }
}