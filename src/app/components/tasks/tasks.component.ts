import { Component, OnInit } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from './Task'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NewTaskComponent } from './new-task/new-task.component';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  editMode: boolean = false;
  isLoading: boolean = false;
  notStarted: Task[] = [];
  inProgress: Task[] = [];
  completed: Task[] = [];
  updateID: number | undefined;
  updateGroup: Task[] = [];


  delta: number = 6;
  startX: number = 0
  startY: number = 0
  sortOptions = ['Due Date: Nearest', 'Due Date: Furthest', 'Created at: Newest', 'Created at: Oldest']
  sortNotStartedButtonText: string = 'Sort By';
  sortInProgressButtonText: string = 'Sort By';
  sortCompletedButtonText: string = 'Sort By';


  constructor(
    private tasksService: TasksService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.tasksService.getTasks().subscribe(
      (response: Task[]) => {
        if (localStorage.getItem('notStarted')) {
          this.notStarted = JSON.parse(localStorage.getItem('notStarted') || "")
        } else {
          this.notStarted = response.filter(task => task.status === 'NotStarted');
        }
        if (localStorage.getItem('inProgress')) {
          this.inProgress = JSON.parse(localStorage.getItem('inProgress') || "")
        } else {
          this.inProgress  = response.filter(task => task.status === 'InProgress');
        }
        if (localStorage.getItem('completed')) {
          this.completed = JSON.parse(localStorage.getItem('completed') || "")
        } else {
          this.completed = response.filter(task => task.status === 'Completed');
        }
        localStorage.setItem('notStarted', JSON.stringify(this.notStarted));
        localStorage.setItem('inProgress', JSON.stringify(this.inProgress));
        localStorage.setItem('completed', JSON.stringify(this.completed));
        this.isLoading = false;
      }
    )
  }

  openDialog(): void {
    this.dialog.open(NewTaskComponent, {
      position: {top: '11rem'},
      width: '25vw',
      data: {notStarted: this.notStarted, inProgress: this.inProgress, completed: this.completed}
    });
  }

  drop(event: CdkDragDrop<Task[]>, status: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      localStorage.setItem('notStarted', JSON.stringify(this.notStarted));
      localStorage.setItem('inProgress', JSON.stringify(this.inProgress));
      localStorage.setItem('completed', JSON.stringify(this.completed));
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      event.container.data[event.currentIndex].status = status;
      localStorage.setItem('notStarted', JSON.stringify(this.notStarted));
      localStorage.setItem('inProgress', JSON.stringify(this.inProgress));
      localStorage.setItem('completed', JSON.stringify(this.completed));
    }
  }

  deleteTask(tasks: Task[], index: number) {
    tasks.splice(index, 1);
    localStorage.setItem('notStarted', JSON.stringify(this.notStarted));
    localStorage.setItem('inProgress', JSON.stringify(this.inProgress));
    localStorage.setItem('completed', JSON.stringify(this.completed));
  }

  onEdit(tasks: Task[], index: number) {
    this.editMode = true;
    this.updateID = index;
    this.updateGroup = tasks;
    const {name, description, status, dueDate, createdAt} = tasks[index]
    this.dialog.open(NewTaskComponent, {
      width: '25vw',
      data: {
        name,
        description,
        status,
        dueDate,
        createdAt,
        notStarted: this.notStarted,
        inProgress: this.inProgress,
        completed: this.completed,
        updateID: this.updateID,
        updateGroup: this.updateGroup,
        edit: true
      }
    });
  }

  previousLocation(event: MouseEvent) {
    this.startX = event.pageX;
    this.startY = event.pageY;
  }

  currentLocation(event: MouseEvent, panel: MatExpansionPanel) {
    const diffX = Math.abs(event.pageX - this.startX);
    const diffY = Math.abs(event.pageY - this.startY);
    if (diffX > this.delta || diffY > this.delta) {
      panel.toggle()
    }
  }

  sortTasks(tasks: Task[], sortFilter: string, direction: string) {
    if (sortFilter === 'Due Date') {
      tasks.map((obj) => {
        return {...obj, date: DateTime.fromISO(<string>obj.dueDate)};
      });
    } else {
      tasks.map((obj) => {
        return {...obj, date: DateTime.fromISO(<string>obj.createdAt)};
      });
    }
    switch (sortFilter) {
      case 'Due Date':
        switch (direction) {
          case 'asc':
            tasks.sort(function (a, b) {
              // @ts-ignore
              return (a.dueDate < b.dueDate) ? -1 : ((a.dueDate > b.dueDate) ? 1 : 0);
            });
            break
          case 'desc':
            tasks.sort(function (a, b) {
              // @ts-ignore
              return (a.dueDate > b.dueDate) ? -1 : ((a.dueDate < b.dueDate) ? 1 : 0);
            });
            break
          default:
          // error handling
        }
        break;
      case 'Created at':
        switch (direction) {
          case 'asc':
            tasks.sort(function (a, b) {
              // @ts-ignore
              return (a.createdAt < b.createdAt) ? -1 : ((a.createdAt > b.createdAt) ? 1 : 0);
            });
            break
          case 'desc':
            tasks.sort(function (a, b) {
              // @ts-ignore
              return (a.createdAt > b.createdAt) ? -1 : ((a.createdAt < b.createdAt) ? 1 : 0);
            });
            break
          default:
            // error handling
            break;
        }
    }
  }

  onSelectSort(option: string, tasks: Task[], container: string) {
    switch (container) {
      case 'Not Started':
        this.sortNotStartedButtonText = option
        break
      case 'In Progress':
        this.sortInProgressButtonText = option
        break
      case 'Completed':
        this.sortCompletedButtonText = option
        break
    }
    switch (option) {
      case 'Due Date: Nearest':
        this.sortTasks(tasks, 'Due Date', 'asc')
        break;
      case 'Due Date: Furthest':
        this.sortTasks(tasks, 'Due Date', 'desc')
        break;
      case 'Created at: Newest':
        this.sortTasks(tasks, 'Created at', 'desc')
        break;
      case 'Created at: Oldest':
        this.sortTasks(tasks, 'Created at', 'asc')
        break;
    }
  }
}
