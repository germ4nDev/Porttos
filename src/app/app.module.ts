// import { AdministracionBDModule } from './plataforma/administracion-bd/administracion-bd.module';
// Angular Import
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// project import
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { ConfigurationComponent } from './theme/layout/admin/configuration/configuration.component';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { ChatMsgComponent } from './theme/layout/admin/nav-bar/nav-right/chat-msg/chat-msg.component';
import { ChatUserListComponent } from './theme/layout/admin/nav-bar/nav-right/chat-user-list/chat-user-list.component';
import { FriendComponent } from './theme/layout/admin/nav-bar/nav-right/chat-user-list/friend/friend.component';
import { SharedModule } from './theme/shared/shared.module';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

// third party
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageSelectorComponent } from './theme/shared/components/language-selector/language-selector.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AuthInterceptor } from './theme/shared/_helpers/auth.interceptor';
import { environment } from '../environments/environment';
import { JwtInterceptor } from './theme/shared/_helpers/jwt-interceptor.interceptor';
import { ErrorInterceptor } from './theme/shared/_helpers/error.interceptor';
import { IaChatFlotanteComponent } from "./theme/shared/components/ia-chat-flotante/ia-chat-flotante.component";
import { NgChartsModule } from 'ng2-charts';

const config: SocketIoConfig = {
    url: environment.sctUrl,
    options: {
        transports: ['websocket', 'polling']
    }
};

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent, GuestComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SharedModule,
        FormsModule,
        AdminComponent,
        ConfigurationComponent,
        NavBarComponent,
        NavLeftComponent,
        NavRightComponent,
        ChatMsgComponent,
        ChatUserListComponent,
        FriendComponent,
        ReactiveFormsModule,
        LanguageSelectorComponent,
        NavContentComponent,
        BrowserAnimationsModule,
        NavigationComponent,
        HttpClientModule,
        NgChartsModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
            defaultLanguage: 'es',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        ToastrModule.forRoot({
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
            progressBar: true,
            closeButton: true
        }),
        SocketIoModule.forRoot(config),
        IaChatFlotanteComponent
    ],
    exports: [
        NavContentComponent,
        AdminComponent,
        NavBarComponent,
        NavLeftComponent,
        ChatMsgComponent,
        ChatUserListComponent,
        ConfigurationComponent,
        FriendComponent
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
