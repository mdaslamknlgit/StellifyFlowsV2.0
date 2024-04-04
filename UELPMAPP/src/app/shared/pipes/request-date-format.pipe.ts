import { Pipe, PipeTransform } from "@angular/core";
import *  as moment from "moment";
import { Time } from "@angular/common";

@Pipe({
  name: 'RequestDateFormat'
})
export class RequestDateFormatPipe implements PipeTransform {
  transform(newDate: Date | string): any {
    return moment(newDate).format("YYYY-MM-DD HH:mm").toLocaleString();
  }
  transformAccrual(newDate: Date | string): any {
    return moment(newDate).format("DD-MMM-YYYY HH:mm").toLocaleString();
  }
  transformDateWithNull(newDate: Date | string): any {
    return (newDate == '' || newDate == null) ? newDate : moment(newDate).format("YYYY-MM-DD HH:mm").toLocaleString();
  }
  transformYYYYMMDD(newDate: Date | string): any {
    debugger;
    const result=moment(newDate).format("YYYY-MM-DD").toLocaleString();
    return result;
  }
}