import { LocalStorageService } from './../local-storage.service';
import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { INIT_FLAG } from '../local-storage.namespace';

@Injectable({
    providedIn: 'root'
})
export class InitGuardService implements CanActivate {
    constructor(private store: LocalStorageService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const init = !!this.store.get(INIT_FLAG);

        if (state.url.includes('setup') && init) {
            this.router.navigateByUrl('/main');
            return false;
        }
        if (!state.url.includes('setup') && !init) {
            this.router.navigateByUrl('/setup');
            return false;
        }

        return true;
    }
}
