import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOpenordersAionComponent } from './exchange-openorders-aion.component';

describe('ExchangeOpenordersAionComponent', () => {
  let component: ExchangeOpenordersAionComponent;
  let fixture: ComponentFixture<ExchangeOpenordersAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOpenordersAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOpenordersAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
