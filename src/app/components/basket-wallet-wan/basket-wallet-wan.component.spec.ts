import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketWalletWanComponent } from './basket-wallet-wan.component';

describe('BasketWalletWanComponent', () => {
  let component: BasketWalletWanComponent;
  let fixture: ComponentFixture<BasketWalletWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketWalletWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketWalletWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
