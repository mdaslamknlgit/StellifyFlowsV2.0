import { AfterViewInit,Directive,ElementRef,Input,HostListener,Renderer2,OnInit, OnChanges } from "@angular/core";
@Directive({
    selector: '[showmore]'
})
export class ShowMoreDirective implements OnChanges,AfterViewInit
{
    @Input('value') textContent:string;
    private elementRef: HTMLElement;
    constructor(public element: ElementRef,
                private rendererObj:Renderer2) {
        this.elementRef = element.nativeElement;

    }
    ngAfterViewInit():void{

    }
    ngOnChanges(): void {
        // perform height adjustments after input changes, if height is different
        if(this.elementRef!=undefined && this.textContent!=null)
        {
           this.textContent = this.textContent.replace(/\n/g,"<br/>");
           if(this.textContent.length > 100)
           {
                this.elementRef.innerHTML = this.textContent.slice(0,100)+"<span class='showMore' style='color:blue;cursor:pointer;'>...ShowMore</span>";
                this.bindShowMoreClickEvent();
           }
           else
           {
                this.elementRef.innerHTML = this.textContent;
           }
        }
    }
    bindShowMoreClickEvent()
    {
        this.elementRef.getElementsByClassName('showMore').item(0).addEventListener('click',()=>{
             if(this.textContent!=null)
             {
                this.elementRef.innerHTML =this.textContent+"<span class='showLess' style='color:blue;cursor:pointer;'>...ShowLess</span>";
                this.bindShowLessClickEvent();
             }
        });
    }
    bindShowLessClickEvent()
    {
        this.elementRef.getElementsByClassName('showLess').item(0).addEventListener('click',()=>{
            if(this.textContent!=null)
            {
                this.elementRef.innerHTML = this.textContent.slice(0,100)+"<span class='showMore' style='color:blue;cursor:pointer;'>...ShowMore</span>";
                this.bindShowMoreClickEvent();
            }
        });
    }
}