import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoaAccountTypeComponent } from './coa-account-type.component';

describe('CoaAccountTypeComponent', () => {
  let component: CoaAccountTypeComponent;
  let fixture: ComponentFixture<CoaAccountTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoaAccountTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoaAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
