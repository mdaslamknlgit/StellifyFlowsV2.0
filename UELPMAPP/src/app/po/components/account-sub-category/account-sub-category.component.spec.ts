import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSubCategoryComponent } from './account-sub-category.component';

describe('AccountSubCategoryComponent', () => {
  let component: AccountSubCategoryComponent;
  let fixture: ComponentFixture<AccountSubCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSubCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSubCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
