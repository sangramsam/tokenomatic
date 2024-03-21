import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketWanComponent } from './basket-wan.component';

describe('BasketWanComponent', () => {
  let component: BasketWanComponent;
  let fixture: ComponentFixture<BasketWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
