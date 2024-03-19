import { Component, OnInit } from '@angular/core';


export interface myinterface {
  remove(index: number);
}

@Component({
  selector: 'app-child-node',
  templateUrl: './child-node.component.html',
  styleUrls: ['./child-node.component.css']
})
export class ChildNodeComponent   {
  showchildtable: boolean = false;
  public index: number;
  public selfRef2: ChildNodeComponent;

  //interface for Parent-Child interaction
  public compInteraction: myinterface;

  constructor() {
  }

  removeMe(index) {  
    this.compInteraction.remove(index)
  }

  createComponent(){
    
  }

}
