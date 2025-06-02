// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { firebaseConfig } from '../environments/firebase.config';
import { CommonModule } from '@angular/common'
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

import { provideFirestore, getFirestore } from '@angular/fire/firestore';



export const appConfig: ApplicationConfig = {
  providers: [

    provideRouter(routes, withViewTransitions()),

    provideRouter(routes),
    provideLottieOptions({
      player: () => player,
    }),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore())

  ]
};
