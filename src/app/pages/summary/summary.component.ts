import { Component, OnInit, HostBinding } from '@angular/core';
import { SummaryService } from './summary.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import {
    USERNAME,
    START_USING_DATE
} from '../../services/local-storage.namespace';
import { getTodayTime, ONE_DAY } from '../../../utils/time';
import { Summary } from '../../../domain/entities';
import { summaryTransition } from './summary.animations';

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss'],
    animations: [summaryTransition]
})
export class SummaryComponent implements OnInit {
    username = this.store.get(USERNAME) || 'username';
    dateCount = Math.floor(
        (getTodayTime() - this.store.get(START_USING_DATE)) / ONE_DAY + 1
    );

    @HostBinding('@summaryTransition') private state = 'activated';

    constructor(
        private summaryService: SummaryService,
        private store: LocalStorageService,
        private router: Router,
        private noti: NzNotificationService
    ) {}

    ngOnInit() {
        this.summaryService.doSummary();
    }

    requestForDate(date: Date): Summary | null {
        return this.summaryService.summaryForDate(date.getTime());
    }

    showSummaryDetail(summary: Summary): void {
        if (!summary) {
            return;
        }

        const { cCount, uCount } = summary;

        if (uCount) {
            this.noti.error(
                '有未完成的项目',
                `你完成了全部任务的${cCount / (cCount + uCount)}%`
            );
        } else if (cCount) {
            this.noti.success('完成了这一天的全部任务', '干的漂亮');
        }
    }

    goBack(): void {
        this.router.navigateByUrl('/main');
    }
}
