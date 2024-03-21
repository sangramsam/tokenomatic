import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWalletSellAionComponent } from './exchange-wallet-sell-aion.component';

describe('ExchangeWalletSellAionComponent', () => {
  let component: ExchangeWalletSellAionComponent;
  let fixture: ComponentFixture<ExchangeWalletSellAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWalletSellAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWalletSellAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
