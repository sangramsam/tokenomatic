import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangePlatformTokenSelectAionComponent } from './exchange-platform-token-select-aion.component';

describe('ExchangePlatformTokenSelectAionComponent', () => {
  let component: ExchangePlatformTokenSelectAionComponent;
  let fixture: ComponentFixture<ExchangePlatformTokenSelectAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangePlatformTokenSelectAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangePlatformTokenSelectAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
