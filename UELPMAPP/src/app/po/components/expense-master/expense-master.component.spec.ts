import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseMasterComponent } from './expense-master.component';

describe('ExpenseMasterComponent', () => {
  let component: ExpenseMasterComponent;
  let fixture: ComponentFixture<ExpenseMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
