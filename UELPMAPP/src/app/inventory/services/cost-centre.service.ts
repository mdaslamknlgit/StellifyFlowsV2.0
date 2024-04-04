import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable()
export class CostCentreService 
{

  itemsEndpoint : string = `${environment.apiEndpoint}`;

  constructor(private apiService: ApiService) { 

  }
  getCostCentres(displayInput:any) {   
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/costCentres`, getReqHeaders,httpParam); 
  }

  GetCostCentresById(CostCenterId:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/costCentres/GetCostCentresById/${CostCenterId}`,getReqHeaders); 
  }
  searchCostCentres(displayInput:any)
  {
    let getReqHeaders = new HttpHeaders();
    let httpParam = new HttpParams({
      fromObject:displayInput
    });
    return this.apiService.getResults(`${this.itemsEndpoint}/costCentres/search`, getReqHeaders,httpParam); 
  }
  getCostCentreDetails(costCentreId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.getResults(`${this.itemsEndpoint}/costCentres/${costCentreId}`, getReqHeaders); 
  } 
  createCostCentre(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.postData(`${this.itemsEndpoint}/costCentres`,data, getReqHeaders); 
  }
  deleteCostCentre(costCentreId:number,userId:number) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.deleteData(`${this.itemsEndpoint}/costCentres/${costCentreId}/${userId}`,getReqHeaders); 
  } 
  updateCostCentre(data:any) {   
    let getReqHeaders = new HttpHeaders();
    return this.apiService.putData(`${this.itemsEndpoint}/costCentres`,data,getReqHeaders); 
  } 
}


