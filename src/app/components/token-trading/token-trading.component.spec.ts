import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenTradingComponent } from './token-trading.component';

describe('TokenTradingComponent', () => {
  let component: TokenTradingComponent;
  let fixture: ComponentFixture<TokenTradingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenTradingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenTradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
