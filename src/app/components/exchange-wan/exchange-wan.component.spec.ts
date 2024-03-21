import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeWanComponent } from './exchange-wan.component';

describe('ExchangeWanComponent', () => {
  let component: ExchangeWanComponent;
  let fixture: ComponentFixture<ExchangeWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
