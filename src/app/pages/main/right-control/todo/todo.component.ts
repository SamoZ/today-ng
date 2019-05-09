import { ListService } from './../../../../services/list/list.service';
import { List } from './../../../../../domain/entities';
import { Subject, combineLatest } from 'rxjs';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Todo } from '../../../../../domain/entities';
import { TodoService } from '../../../../services/todo/todo.service';
import { takeUntil } from 'rxjs/operators';
import { floorToDate, getTodayTime } from '../../../../../utils/time';
import { NzDropdownContextComponent, NzDropdownService } from 'ng-zorro-antd';
import { RankBy } from 'src/domain/type';
import { Router } from '@angular/router';

const rankerGennerator = (type: RankBy = 'title'): any => {
    if (type === 'completeFlag') {
        return (t1: Todo, t2: Todo) => t1.completedFlag && !t2.completedFlag;
    }

    return (t1: Todo, t2: Todo) => {
        return t1[type] > t2[type] ? 1 : -1;
    }
}

@Component({
    selector: 'app-todo',
    templateUrl: './todo.component.html',
    styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
    private dropdown: NzDropdownContextComponent;
    private destory$ = new Subject();

    todos: Todo[] = [];
    lists: List[] = [];
    currentContextTodo: Todo;

    constructor(
        private router: Router,
        private listService: ListService,
        private todoService: TodoService,
        private dropdownService: NzDropdownService
    ) {}

    ngOnInit() {
        this.listService.lists$
            .pipe(takeUntil(this.destory$))
            .subscribe(lists => {
                this.lists = lists;
            });
        
        combineLatest(this.listService.currentUuid$, this.todoService.todo$, this.todoService.rank$)
            .pipe(takeUntil(this.destory$))
            .subscribe(sources => {
                this.processTodos(sources[0], sources[1], sources[2]);
            });

        this.todoService.getAll();
        this.listService.getAll();
    }

    ngOnDestroy(): void {
        this.destory$.next();
    }

    private processTodos(listUUID: string, todos: Todo[], rank: RankBy): void {
        const filteredTodos = todos
            .filter(todo => {
                return (
                    (listUUID === 'today' &&
                        todo.planAt &&
                        floorToDate(todo.planAt) <= getTodayTime()) ||
                    (listUUID === 'todo' &&
                        (!todo.listUUID || todo.listUUID === 'todo')) ||
                    listUUID === todo.listUUID
                );
            })
            .map(todo => Object.assign({}, todo) as Todo)
            .sort(rankerGennerator(rank));

        this.todos = [...filteredTodos];
    }

    add(title: string): void {
        this.todoService.add(title);
    }

    contextMenu(
        $event: MouseEvent,
        template: TemplateRef<void>,
        uuid: string
    ) {
        this.dropdown = this.dropdownService.create($event, template);
        this.currentContextTodo = this.todos.find(t => t._id === uuid);
    }

    listsExcept(listUUID: string): List[] {
        return this.lists.filter(l => l._id !== listUUID);
    }

    toggle(uuid: string) {
        this.todoService.toggleTodoComplete(uuid);
    }

    delete() {
        this.todoService.delete(this.currentContextTodo._id);
    }

    setToday() {
        this.todoService.setTodoToday(this.currentContextTodo._id);
    }

    moveToList(listUuid: string) {
        this.todoService.moveToList(this.currentContextTodo._id, listUuid);
    }

    close() {
        this.dropdown.close();
    }

    click(uuid: string) {
        this.router.navigateByUrl(`/main/${uuid}`);
    }
}
