import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPagoComponent } from './gestion-pago.component';

describe('GestionPagoComponent', () => {
  let component: GestionPagoComponent;
  let fixture: ComponentFixture<GestionPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
