import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxGroupComponent } from './tax-group.component';

describe('TaxGroupComponent', () => {
  let component: TaxGroupComponent;
  let fixture: ComponentFixture<TaxGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
