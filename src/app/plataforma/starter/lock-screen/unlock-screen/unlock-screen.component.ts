/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, tap } from 'rxjs/operators';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthenticationService } from 'src/app/theme/shared/service/authentication.service';
import { of, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component';
import Swal from 'sweetalert2';
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service';
import { FullScreenSliderComponent } from "src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component";

@Component({
  selector: 'app-unlock-screen',
  standalone: true,
    imports: [CommonModule, RouterModule, SharedModule, TranslateModule, LanguageSelectorComponent, FullScreenSliderComponent],
  templateUrl: './unlock-screen.component.html',
  styleUrl: './unlock-screen.component.scss'
})
export class UnlockScreenComponent implements OnInit {
    //#region VARIABLES
    classList!: { toggle: (arg0: string) => void };
    loginForm!: FormGroup;
    loginSub?: Subscription;
    usernameValue: string = '';
    userPassword: string = '';
    returnUrl!: string;
    error: string = '';
    loading: boolean = false;
    submitted: boolean = false;
    // remember: boolean = false;
    //#endregion VARIABLES

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private _localStorageService: LocalStorageService,
        private authenticationService: AuthenticationService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            const usuario = this._localStorageService.getUsuarioLocalStorage();
            this.usernameValue = usuario.userNameUsuario;
            //    this.router.navigate(['/dashboard/analytics']);
        }
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: [this.usernameValue, Validators.required],
            password: ['', Validators.required]
        });

        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#password');

        togglePassword?.addEventListener('click', () => {
            const type = password?.getAttribute('type') === 'password' ? 'text' : 'password';
            password?.setAttribute('type', type);
            this.classList.toggle('icon-eye-off');
        });

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    }

    OnDestroy() {
        this.loginSub?.unsubscribe();
    }

    get formValues() {
        return this.loginForm.controls;
    }

    get usernameControl() {
        return this.loginForm.get('username');
    }

    get passwordControl() {
        return this.loginForm.get('password');
    }

    onLoginUserClick(): void {
        this.submitted = true;
        if (this.loginForm.invalid) {
            return;
        }
        this.error = '';
        this.loading = true;
        const email = this.formValues?.['username']?.value;
        const password = this.formValues?.['password']?.value;

        this.loginSub = this.authenticationService.login(email, password).pipe(
            tap((resp: any) => {
                this.loading = false;
                if (!resp.ok) {
                    Swal.fire({
                        title: resp.msg,
                        text: 'La dirección de correo electrónico ingresada no se encuentra registrada en nuestro sistema!',
                        icon: 'error',
                        showCloseButton: true
                    });
                    return;
                }
                console.log('unlock exitoso:', resp);
                const lockedUrl = sessionStorage.getItem('locked_url');
                sessionStorage.removeItem('locked_url');
                const navigateTo = lockedUrl || '/frontal/home';
                this.router.navigateByUrl(navigateTo);
            }),
            catchError((err) => {
                this.loading = false;
                this.error = err;
                Swal.fire('Error', err, 'error');
                return of(null);
            })
        ).subscribe();
    }

    cancelarUnlock() {
        this.router.navigate(['/starter/lock-screen']);
    }

}
