import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapexPurposeComponent } from './capex-purpose.component';

describe('CapexPurposeComponent', () => {
  let component: CapexPurposeComponent;
  let fixture: ComponentFixture<CapexPurposeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapexPurposeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapexPurposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
