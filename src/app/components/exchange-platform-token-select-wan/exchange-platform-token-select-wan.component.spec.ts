import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangePlatformTokenSelectWanComponent } from './exchange-platform-token-select-wan.component';

describe('ExchangePlatformTokenSelectWanComponent', () => {
  let component: ExchangePlatformTokenSelectWanComponent;
  let fixture: ComponentFixture<ExchangePlatformTokenSelectWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangePlatformTokenSelectWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangePlatformTokenSelectWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
