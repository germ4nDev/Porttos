import { HttpContextToken } from '@angular/common/http';

export const SKIP_TOKEN_INTERCEPTOR = new HttpContextToken<boolean>(() => false);
