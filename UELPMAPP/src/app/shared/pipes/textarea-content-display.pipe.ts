import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';
import *  as moment from "moment";
import { text } from "@fortawesome/fontawesome-svg-core";

@Pipe({
    name:'TextAreaContentDisplay'
})
export class TextAreaContentDisplay implements PipeTransform
{
    constructor( private sanitized: DomSanitizer)
    {

    }
    transform(textContent:string): any {

        if(textContent!=null)
        {
            return textContent.replace(/\n/g,"<br/>");
        }
        return "";
    }
}