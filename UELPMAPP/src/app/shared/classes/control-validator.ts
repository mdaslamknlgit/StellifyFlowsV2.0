import { AbstractControl, ValidationErrors } from "@angular/forms";

export class ControlValidator {
    static Validator(control: AbstractControl): ValidationErrors | null {
        var value: string = control.value;
        if ((value == null) || (value.length > 0 && value.trim().length == 0)) {
            return { invaliddata: true }
        }
        return null;
    }
}
