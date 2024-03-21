import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LivepeerStakingComponent } from './livepeer-staking.component';

describe('LivepeerStakingComponent', () => {
  let component: LivepeerStakingComponent;
  let fixture: ComponentFixture<LivepeerStakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LivepeerStakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LivepeerStakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
