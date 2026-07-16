import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionesSustraccionesComponent } from './adiciones-sustracciones.component';

describe('AdicionesSustraccionesComponent', () => {
  let component: AdicionesSustraccionesComponent;
  let fixture: ComponentFixture<AdicionesSustraccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdicionesSustraccionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdicionesSustraccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
