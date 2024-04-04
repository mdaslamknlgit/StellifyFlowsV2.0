import { Pipe, PipeTransform } from "@angular/core";
import { FormArray } from "@angular/forms";

@Pipe({
    name:'DetailedNumberFormat'
})
export class DetailedNumberFormatPipe implements PipeTransform
{
    transform(assetGroupControl: FormArray,currentIndex:number): any {

       let lastParentIndexs:number[]= assetGroupControl.controls.filter((control,index)=>control.get('IsDetailed').value!=true && index < currentIndex).map((DataCue,index)=>index);
       let lastParentSerialNumber = Math.max.apply(null,lastParentIndexs)+1;
       let currentRecordSerialNumber = currentIndex+1;
       let lastChildIndex = lastParentSerialNumber+"."+(currentRecordSerialNumber-lastParentSerialNumber);
       return lastChildIndex;
    }
}