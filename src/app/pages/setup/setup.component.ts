import { INIT_FLAG, START_USING_DATE, USERNAME } from './../../services/local-storage.namespace';
import { Component, OnInit, HostBinding } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';
import { getTodayTime } from '../../../utils/time';
import { Router } from '@angular/router';
import { setupTransition } from './setup.animations';

@Component({
    selector: 'app-setup',
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.scss'],
    animations: [setupTransition]
})
export class SetupComponent implements OnInit {
    @HostBinding('@setupTransition') state = 'activated';
    
    username: string;

    constructor(
        private store: LocalStorageService,
        private router: Router
    ) {}

    ngOnInit() {}

    completeSetup(): void {
        this.store.set(INIT_FLAG, true);
        this.store.set(START_USING_DATE, getTodayTime());
        this.store.set(USERNAME, this.username);

        this.router.navigateByUrl('main');
    }
}
