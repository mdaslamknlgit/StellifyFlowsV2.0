import { AfterViewInit,Directive,ElementRef,Input,Renderer2, OnChanges } from "@angular/core";
@Directive({
    selector: '[CustomSpinner]',
})
export class CustomSpinnerDirective implements OnChanges,AfterViewInit
{
    @Input('CustomSpinner') showLoadingIcon:boolean;
    private elementRef: HTMLElement;
    constructor(public element: ElementRef,
                private rendererObj:Renderer2) {
        this.elementRef = element.nativeElement;
    }
    ngAfterViewInit():void{

    }
    ngOnChanges(): void {
        // perform height adjustments after input changes, if height is different
        if(this.elementRef!=undefined)
        {
            if(this.showLoadingIcon==true)
            {
                let node = <HTMLElement>this.rendererObj.createElement("div");
                //node.setAttribute("class","fa fa-spinner fa-pulse spinnerIcon");
                node.setAttribute("class","loader")
                this.elementRef.appendChild(node);
            }
            else
            {
                let nodes = this.elementRef.querySelector(".loader");
                try{
                    this.elementRef.removeChild(nodes);
                }
                catch(error)
                {

                }
            }
        }
    }
}