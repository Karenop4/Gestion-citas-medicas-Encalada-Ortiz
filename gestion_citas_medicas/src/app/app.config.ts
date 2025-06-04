// src/app/app.config.ts

import { ApplicationConfig, LOCALE_ID} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { firebaseConfig } from '../environments/firebase.config';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { withInMemoryScrolling } from '@angular/router';

import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es-ES');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    provideRouter(routes, withViewTransitions()),

    provideRouter(routes,withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Desplaza al inicio de la página
        anchorScrolling: 'enabled' // Opcional: Permite el desplazamiento a anclas (#id)
      })),
    provideLottieOptions({
      player: () => player,
    }),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore())

  ]
};
