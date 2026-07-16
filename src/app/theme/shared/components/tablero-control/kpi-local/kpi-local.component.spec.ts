import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiLocalComponent } from './kpi-local.component';

describe('KpiLocalComponent', () => {
  let component: KpiLocalComponent;
  let fixture: ComponentFixture<KpiLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiLocalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KpiLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
