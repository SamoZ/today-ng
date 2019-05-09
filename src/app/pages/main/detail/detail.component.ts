import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    HostBinding
} from '@angular/core';
import { Todo } from 'src/domain/entities';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { TodoService } from 'src/app/services/todo/todo.service';
import { NzMessageService } from 'ng-zorro-antd';
import { first } from 'rxjs/operators';
import {
    floorToDate,
    getTodayTime,
    getCurrentTime,
    floorToMinute,
    lessThanADay
} from 'src/utils/time';
import { detailTransition } from './detail.animation';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    animations: [detailTransition]
})
export class DetailComponent implements OnInit {
    @HostBinding('@detailTransition') state = 'activated';

    @Output() changedTodo = new EventEmitter();

    private trueSource: Todo;

    currentTodo: Todo;
    dueDate: Date;
    planDate: Date;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private todoService: TodoService,
        private message: NzMessageService
    ) {}

    ngOnInit() {
        this.route.paramMap.pipe(first()).subscribe((paramsMap: ParamMap) => {
            const id = paramsMap.get('id');
            const todo = this.todoService.getByUUID(id);
            this.trueSource = todo;
            this.currentTodo = Object.assign({}, todo) as Todo;
            if (todo.dueAt) {
                this.dueDate = new Date(todo.dueAt);
            }
            if (todo.planAt) {
                this.planDate = new Date(todo.planAt);
            }
        });
    }

    goBack() {
        this.router.navigateByUrl('main');
    }

    handlePlanDateChange(date: Date) {
        const t = date ? date.getTime() : undefined;
        if (!t) {
            this.currentTodo.notifyMe = false;
        }
        this.currentTodo.planAt = t;
        this.checkDate();
    }

    handleDueDateChange(date: Date) {
        const dueAt = date ? date.getTime() : undefined;
        this.currentTodo.dueAt = dueAt;
        if (dueAt && lessThanADay(dueAt)) {
            this.message.warning('项目将会在24小时内到期', {
                nzDuration: 6000
            });
        }
        this.checkDate();
    }

    private checkDate() {
        const { dueAt, planAt } = this.currentTodo;
        if (dueAt && planAt && floorToDate(planAt) > dueAt) {
            this.message.warning('你确定要在到期之后才开始做这个项目吗？', {
                nzDuration: 6000
            });
        }
    }

    dueDisabledDate = (d: Date): boolean => floorToDate(d) < getTodayTime();
    planDisabledDate = (d: Date): boolean =>
        floorToMinute(d) < getCurrentTime();

    clickSwitch() {
        if (this.currentTodo.completedFlag) {
            return;
        }
        if (!this.currentTodo.planAt) {
            this.message.warning('尚未设置计划日期');
            return;
        }
        this.currentTodo.notifyMe = !this.currentTodo.notifyMe;
    }
    
    confirm() {
        this.todoService.update(this.currentTodo);
        this.goBack();
    }

    delete() {
        this.todoService.delete(this.currentTodo._id);
        this.goBack();
    }
}
