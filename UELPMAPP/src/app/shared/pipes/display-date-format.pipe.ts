import { Pipe, PipeTransform } from "@angular/core";
import *  as moment from "moment";
import { Time } from "@angular/common";

@Pipe({
  name: 'DisplayDateFormat'
})
export class DisplayDateFormatPipe implements PipeTransform {
  transform(newDate: string | Date): any {
    return (newDate == null || newDate == '') ? '' : moment(newDate).format("DD-MM-YYYY").toLocaleString();
  }
}