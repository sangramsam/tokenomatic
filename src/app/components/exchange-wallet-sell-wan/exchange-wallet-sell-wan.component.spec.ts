import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletSellWanComponent } from './exchange-wallet-sell-wan.component';

describe('ExchangeWalletSellWanComponent', () => {
  let component: ExchangeWalletSellWanComponent;
  let fixture: ComponentFixture<ExchangeWalletSellWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletSellWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletSellWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
