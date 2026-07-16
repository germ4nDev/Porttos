import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionInfraestructuraComponent } from './gestion-infraestructura.component';

describe('GestionInfraestructuraComponent', () => {
  let component: GestionInfraestructuraComponent;
  let fixture: ComponentFixture<GestionInfraestructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionInfraestructuraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
