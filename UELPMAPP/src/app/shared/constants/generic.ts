export const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//export const MOBILE_NUMBER_PATTERN = /^\d{15}$/;
export const MOBILE_NUMBER_PATTERN = /^([\+[0-9]{1,5})?([0-9][0-9]{8,10})$/;
export const INTERNATIONAL_NUMBER = /^[^a-zA-Z]*$/;
export const NUMBER_PATERN = /^[0-9]*$/;
export const STRING_PATERN = /^[a-zA-Z ]*$/;
export const ALPHA_NUMERIC = /^(?=.*[a-zA-Z])([a-zA-Z0-9 _-]+)$/;
export const ALPHA_NUMERIC_OR_NUMBER = /^(?=.*[0-9])([a-zA-Z0-9 _-]+)$/;
export const ALPHA_NUMERIC_WITH_SPECIALCHARACTER=/^(?=.*[0-9])([a-zA-Z0-9 &]+)$/                             
export const AMOUNT_PATERN = /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/;   
export const ALLOWED_FILE_TYPES = ["bmp","csv","doc","docx","gif","ico","jpg","jpeg",
                                      "odg","odp","ods","odt","pdf","png","ppt","swf",
                                      "txt","xcf","xls","mp3","mpeg","mp4","docx","rtf","zip","rar"];
export const NOT_ALLOWED_FILE_TYPES = ["asp","aspx","pl","dll","php","cgi","asa","htaccess",
                                      "exe","bat"];
export const IMG_FILE_TYPES = ["img","jpg","jpeg","png"];
// -- local
//export const DEFAULT_CURRENCY_ID=1053;
// -- prod
export const DEFAULT_CURRENCY_ID=187; 



