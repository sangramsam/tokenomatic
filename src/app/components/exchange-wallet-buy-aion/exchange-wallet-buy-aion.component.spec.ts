import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletBuyAionComponent } from './exchange-wallet-buy-aion.component';

describe('ExchangeWalletBuyAionComponent', () => {
  let component: ExchangeWalletBuyAionComponent;
  let fixture: ComponentFixture<ExchangeWalletBuyAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletBuyAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletBuyAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
