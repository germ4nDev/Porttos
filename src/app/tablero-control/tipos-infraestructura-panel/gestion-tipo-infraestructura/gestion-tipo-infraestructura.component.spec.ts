import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionTipoInfraestructuraComponent } from './gestion-tipo-infraestructura.component';

describe('GestionTipoInfraestructuraComponent', () => {
  let component: GestionTipoInfraestructuraComponent;
  let fixture: ComponentFixture<GestionTipoInfraestructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionTipoInfraestructuraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionTipoInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
