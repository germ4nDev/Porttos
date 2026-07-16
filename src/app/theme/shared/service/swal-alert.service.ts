/*
    Author: German Valencia
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnDestroy } from '@angular/core';
import { ThemeService } from './theme.service';
import Swal, { SweetAlertOptions, SweetAlertIcon } from 'sweetalert2';
import { Observable, Subscription, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class SwalAlertService implements OnDestroy {
    private isDarkTheme: boolean = false;
    private themeSub: Subscription;

    constructor(
        private themeService: ThemeService,
        private translate: TranslateService
    ) {
        this.themeSub = this.themeService.isDarkTheme$.subscribe((isDark) => {
            this.isDarkTheme = isDark;
        });
    }

    ngOnDestroy(): void {
        this.themeSub.unsubscribe();
    }

    private getSwalCustomClass() {
        if (!this.isDarkTheme) {
            return {
                container: 'swal2-light-theme-container',
                popup: 'custom-popup-class swal2-light-mode-custom',
                confirmButton: 'btn btn-primary-light confirmButton-color',
                denyButton: 'btn btn-secondary btn-secondary'
            };
        } else {
            return {
                container: 'swal2-dark-theme-container',
                popup: 'custom-popup-class swal2-dark-mode-custom',
                confirmButton: 'btn btn-primary-dark confirmButton-color',
                denyButton: 'btn btn-secondary btn-secondary'
            };
        }
    }

    private fireSwal(options: SweetAlertOptions) {
        return Swal.fire({
            position: 'center',
            showConfirmButton: true,
            customClass: this.getSwalCustomClass(),
            buttonsStyling: false,
            target: 'body',
            ...options
        });
    }

    // ==========================================
    // ALERTAS BÁSICAS SIN TIMER
    // ==========================================
    getAlertConfirmError(descripcion: string) {
        this.fireSwal({
            icon: 'error',
            title: 'Error',
            text: descripcion,
        });
    }

    getAlertConfirmSuccess(descripcion: string) {
        this.fireSwal({
            icon: 'success',
            title: 'Éxito',
            text: descripcion,
        });
    }

    // ==========================================
    // ALERTAS CON LISTADOS HTML
    // ==========================================
    getAlertConfirmWarning(descripcion: string) {
        const listadoIncidencias = descripcion
            .split('\n')
            .map((incidencia) => `<li>${incidencia}</li>`)
            .join('');

        this.fireSwal({
            icon: 'warning',
            title: 'Advertencia',
            html: `<ul style="list-style-type: disc; margin: 0; padding-left: 20px; text-align: left;">${listadoIncidencias}</ul>`,
        });
    }

    // ==========================================
    // ALERTAS CON TIMER (Se cierran solas)
    // ==========================================
    private fireSwalWithTimer(icon: SweetAlertIcon, title: string, text: string) {
        this.fireSwal({
            icon,
            title,
            text,
            timer: 9000,
            timerProgressBar: true // Agrega una barra de progreso visual (opcional pero buena UX)
        });
    }

    getAlertError(descripcion: string) {
        this.fireSwalWithTimer('error', 'Error', descripcion);
    }

    getAlertSuccess(descripcion: string) {
        this.fireSwalWithTimer('success', 'Éxito', descripcion);
    }

    getAlertInfo(descripcion: string) {
        this.fireSwalWithTimer('info', 'Información', descripcion);
    }

    getAlertWarning(descripcion: string) {
        this.fireSwalWithTimer('warning', 'Advertencia', descripcion);
    }

    getAlertQuestion(descripcion: string) {
        this.fireSwalWithTimer('question', 'Pregunta', descripcion);
    }

    // ==========================================
    // PROCESOS REACTIVOS Y DE ESPERA
    // ==========================================
    getAlertQuestionRequest(
        descripcion: string,
        title?: string,
        confirmButtonText?: string,
        cancelButtonText?: string
    ): Observable<boolean> {
        const finalTitle = title || this.translate.instant('USUARIOS.USUARIOS.ELIMINARTITULO');
        const finalConfirm = confirmButtonText || this.translate.instant('PLATAFORMA.ACEPTAR');
        const finalCancel = cancelButtonText || this.translate.instant('PLATAFORMA.CANCEL');

        return from(
            this.fireSwal({
                title: finalTitle,
                text: descripcion,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: finalConfirm,
                cancelButtonText: finalCancel,
                reverseButtons: true
            })
        ).pipe(
            map(result => result.isConfirmed)
        );
    }

    showLoading(title: string, text: string = 'Procesando...'): void {
        this.fireSwal({
            title,
            text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    close(): void {
        Swal.close();
    }
}
