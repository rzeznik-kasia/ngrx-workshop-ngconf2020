import { Injectable } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, tap } from "rxjs/operators";
import { AuthService } from "../shared/services/auth.service";
import { AuthApiActions, AuthUserActions } from "./actions";

@Injectable()
export class AuthEffects {
    constructor(private authService: AuthService, private actions$: Actions) {}

    getAuthStatus$ = createEffect(() => {
        return this.authService
            .getStatus()
            .pipe(map(userOrNull => AuthApiActions.getAuthStatusSuccess(userOrNull)))
    });
        

    login$ = createEffect(() => {
        return this.actions$.pipe(
            ofType( AuthUserActions.login ),
            concatMap((action) => {
                return  this.authService.login(action.username, action.password)
                .pipe(
                    map(user => AuthApiActions.loginSuccess(user)),
                    catchError(reason => of(AuthApiActions.loginFailure(reason)))
                )
            })
        );
    });

    logout$ = createEffect(() => {
        return this.actions$.pipe(
            ofType( AuthUserActions.logout ),
            tap(() => {
                return this.authService.logout()
            })
        )}, { dispatch: false }
    );
}