import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
    name: 'CustomFilter'
})
export class CustomFilterPipe implements PipeTransform {
    transform(selectedId:number,data:Array<object>,fieldToCompare:string,fieldToReturn:string): any {

        let selectedValues:string[]=[];
        if(selectedId!=undefined)
        {
            let record = data.find(j=>j[fieldToCompare]==selectedId);
            if(record!=null)
            {
               selectedValues.push(record[fieldToReturn]);
            }
        }
        return selectedValues.join(",");
    }
}