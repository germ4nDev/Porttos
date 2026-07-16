import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetsService } from 'src/app/theme/shared/service/tablero-control/widgets.service';
import { LocalStorageService } from 'src/app/theme/shared/service'; // 🟢 Tu servicio estrella
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-widget-lobby',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './widget-lobby.component.html',
    styleUrls: ['./widget-lobby.component.scss']
})
export class WidgetLobbyComponent implements OnInit {

    // 1. Interceptamos el input 'visible' para saber el momento exacto en que se abre
    private modalAbierto$ = new BehaviorSubject<boolean>(false);
    private _visible: boolean = false;

    @Input() set visible(value: boolean) {
        this._visible = value;
        if (value) {
            this.modalAbierto$.next(true); // Disparamos la actualización al abrir
        }
    }
    get visible(): boolean { return this._visible; }

    @Output() cerrar = new EventEmitter<void>();
    @Output() widgetSeleccionado = new EventEmitter<any>();

    public catalogo$!: Observable<any[]>;

    constructor(
        private _widgetsService: WidgetsService,
        private _localStorageService: LocalStorageService // 🟢 Inyectamos el estado global
    ) { }

    ngOnInit() {
        // 2. Combinamos el catálogo maestro con el evento de abrir el modal
        this.catalogo$ = combineLatest([
            this._widgetsService.widgets$,
            this.modalAbierto$
        ]).pipe(
            map(([widgets, isOpen]) => {
                if (!widgets || widgets.length === 0) return [];

                // 🟢 3. ¡LA MAGIA!: Leemos la pestaña directamente desde tu servicio
                // Esto garantiza que siempre tomamos la verdad absoluta del sistema
                const pestanaActual = this._localStorageService.pestana;

                // 4. Filtramos
                return widgets.filter((w: any) =>
                    w.codigo_pestana === pestanaActual ||
                    w.pestana === pestanaActual
                );
            })
        );
    }

    cerrarModal() {
        this.cerrar.emit();
    }

    agregarWidget(widget: any) {
        this.widgetSeleccionado.emit(widget);
        this.cerrarModal();
    }
}
