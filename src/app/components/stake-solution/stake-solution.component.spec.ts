import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeSolutionComponent } from './stake-solution.component';

describe('StakeSolutionComponent', () => {
  let component: StakeSolutionComponent;
  let fixture: ComponentFixture<StakeSolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakeSolutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeSolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
