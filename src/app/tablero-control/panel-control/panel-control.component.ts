import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LocalStorageService, SwalAlertService } from 'src/app/theme/shared/service';
import { KpiCardComponent } from "src/app/tablero-control/widgets/panel-maritimo/kpi-card/kpi-card.component";
import { CommonModule } from '@angular/common';
import { TerminalPanelComponent } from 'src/app/theme/shared/components/tablero-control/terminal-panel/terminal-panel.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LanguageSelectorComponent } from "src/app/theme/shared/components/language-selector/language-selector.component";
import { ProfileDrpComponent } from "src/app/theme/shared/components/profile-drp/profile-drp.component";
import { Router } from '@angular/router';

@Component({
    selector: 'app-tablero-control',
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule,
        KpiCardComponent,
        TerminalPanelComponent,
        LanguageSelectorComponent,
        ProfileDrpComponent
    ],
    templateUrl: './panel-control.component.html',
    styleUrl: './panel-control.component.scss'
})
export class PanelControlComponent {

    suscriptor: string = '';
    isLoading: boolean = false;
    dataSubscription?: Subscription;

    nodoSeleccionado: string = 'buenaventura';
    pestanaActiva: string = 'operacion_maritima';

    // motonavesMaestras: Motonave[] = [
    //     { nombre: 'CMA CGM ALEXANDER', viaje: '0MX8W1', terminal: 'SPRBUN', tipo: 'Contenedores', eta: '26 MAY 08:00', ata: '26 MAY 07:45', carga: '1,450 TEUs', estado: 'operando' },
    //     { nombre: 'MSC LAUREN', viaje: 'NX312A', terminal: 'SPRBUN', tipo: 'Contenedores', eta: '26 MAY 14:30', ata: 'Pendiente', carga: '890 TEUs', estado: 'fondeo' },
    //     { nombre: 'MAERSK MC-KINNEY', viaje: '2301S', terminal: 'TCBUEN', tipo: 'Contenedores', eta: '26 MAY 11:15', ata: '26 MAY 11:30', carga: '2,100 TEUs', estado: 'operando' },
    //     { nombre: 'GLOVIS CORONA', viaje: 'GC22', terminal: 'AGUADULCE', tipo: 'Ro-Ro', eta: '27 MAY 06:00', ata: 'Pendiente', carga: '450 Vehículos', estado: 'proximo' },
    //     { nombre: 'BBC AMETHYST', viaje: 'BA991', terminal: 'SPRBUN', tipo: 'Carga Suelta', eta: '28 MAY 09:00', ata: 'Pendiente', carga: '3,200 TM', estado: 'proximo' }
    // ];

    constructor(
        private router: Router,
        private _localStorageService: LocalStorageService,
        private _translate: TranslateService,
        private _swalService: SwalAlertService
        // Aquí inyectaremos el servicio del Boletín Portuario más adelante
    ) {
        // Recuperamos el contexto del usuario al instanciar el componente
        console.log('🚨🚨🚨 ESTOY EN EL TS CORRECTO 🚨🚨🚨');
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage();
    }

    ngOnInit(): void {
        console.log('🚢 Inicializando Torre de Control Portuaria para:', this.suscriptor);
        this.cargarDatosDashboard();
    }

    onNodoChange(event: any): void {
        this.nodoSeleccionado = event.target.value;
        console.log('Cambiando contexto operativo al nodo:', this.nodoSeleccionado);

        // Al cambiar de puerto, volvemos a consultar la data
        this.cargarDatosDashboard();
    }

    cambiarPestana(nuevaPestana: string): void {
        if (this.pestanaActiva === nuevaPestana) return;

        this.pestanaActiva = nuevaPestana;
        console.log('Navegando a la pestaña:', this.pestanaActiva);

        if (this.pestanaActiva === 'operacion_maritima') {
            this.cargarDatosDashboard();
        }
    }

    cargarDatosDashboard(): void {
        this.isLoading = true;

        // TODO: Simulación temporal mientras conectamos tu API con las transacciones
        setTimeout(() => {
            this.isLoading = false;
            console.log('✅ Datos del boletín portuario cargados exitosamente.');
        }, 1000);

        /* Estructura final planeada:
        this.dataSubscription = this._maritimoService.obtenerBoletin(this.nodoSeleccionado).subscribe({
            next: (resp) => {
                this.datosBoletin = resp.data;
                this.isLoading = false;
            },
            error: (err) => {
                this._swalService.getAlertError('Error al conectar con la Torre de Control');
                this.isLoading = false;
            }
        });
        */
    }

    ngOnDestroy(): void {
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }
    RegresarClick() {
        this.router.navigate(['/tablero-control/dahboard-panel'])
    }
}
