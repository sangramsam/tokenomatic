import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeAionComponent } from './exchange-aion.component';

describe('ExchangeAionComponent', () => {
  let component: ExchangeAionComponent;
  let fixture: ComponentFixture<ExchangeAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
