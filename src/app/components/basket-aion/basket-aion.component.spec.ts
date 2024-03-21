import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketAionComponent } from './basket-aion.component';

describe('BasketAionComponent', () => {
  let component: BasketAionComponent;
  let fixture: ComponentFixture<BasketAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
