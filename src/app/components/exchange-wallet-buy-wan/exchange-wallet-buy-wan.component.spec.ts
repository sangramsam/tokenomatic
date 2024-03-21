import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletBuyWanComponent } from './exchange-wallet-buy-wan.component';

describe('ExchangeWalletBuyWanComponent', () => {
  let component: ExchangeWalletBuyWanComponent;
  let fixture: ComponentFixture<ExchangeWalletBuyWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletBuyWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletBuyWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
