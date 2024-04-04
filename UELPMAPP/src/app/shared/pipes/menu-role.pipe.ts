import { Pipe, PipeTransform } from "@angular/core";
import { UserDetails } from "../models/shared.model";

@Pipe({
    name: 'MenuRole'
})
export class MenuRolePipe implements PipeTransform {
    transform(allowedRoles: string[]): any {

        //console.log(sessionStorage.getItem('userDetails'));
        let currentUserDetails: UserDetails = JSON.parse(sessionStorage.getItem('userDetails'));        
        return currentUserDetails.Roles.some(r => r.RoleName.trim().toLowerCase() === allowedRoles[0].trim().toLowerCase());
        //return allowedRoles.findIndex(i => i == currentUserDetails.UserRole) > -1 ? true : false;
    }

    
}