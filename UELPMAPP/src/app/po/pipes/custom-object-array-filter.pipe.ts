import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
    name: 'CustomObjArrayFilter'
})
export class CustomObjArrayFilterPipe implements PipeTransform {
    transform(selectedIds:Array<object>,data:Array<object>,fieldToCompare:string,fieldToReturn:string): any {

        let selectedValues:string[]=[];
        if(selectedIds!=undefined)
        {
            selectedIds.forEach(obj=>{
                let record = data.find(j=>j[fieldToCompare]==obj[fieldToCompare]);
                if(record!=null)
                {
                   selectedValues.push(record[fieldToReturn]);
                }
            });
        }
        return selectedValues.join(",");
    }
}