import { TodoService } from './../../../../../services/todo/todo.service';
import { Subscription } from 'rxjs';
import { Todo } from './../../../../../../domain/entities';
import { Component, OnInit } from '@angular/core';
import { floorToDate, getTodayTime, ONE_DAY } from 'src/utils/time';

@Component({
    selector: 'app-suggest',
    templateUrl: './suggest.component.html',
    styleUrls: ['./suggest.component.scss']
})
export class SuggestComponent implements OnInit {
    suggestedTodo: Todo[] = [];

    private todo$: Subscription;

    constructor(
        private todoService: TodoService
    ) {}

    ngOnInit() {
        this.todo$ = this.todoService.todo$.subscribe(todos => {
            const filtered = todos.filter(t => {
                if (t.planAt && floorToDate(t.planAt) <= getTodayTime()) {
                    return false;
                }
                if (t.dueAt && t.dueAt - getTodayTime() <= ONE_DAY * 2) {
                    return true;
                }
                return false;
            });
            this.suggestedTodo = [].concat(filtered);
        });
        this.todoService.getAll();
    }

    ngOnDestroy(): void {
        this.todo$.unsubscribe();
    }

    setTodoToday(todo: Todo) {
        this.todoService.setTodoToday(todo._id);
    }
}
