import { Component, OnInit } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from './Task'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as moment from 'moment';

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


  constructor(
    private tasksService: TasksService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {

    this.isLoading = true;
    this.tasksService.getTasks().subscribe(
      (response: Task[]) => {
        this.notStarted = response.filter(task => task.status === 'NotStarted');
        this.inProgress = response.filter(task => task.status === 'InProgress');
        this.completed = response.filter(task => task.status === 'Completed');
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
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      event.container.data[event.currentIndex].status = status;
    }
  }

  deleteTask(tasks: Task[], index: number) {
    tasks.splice(index, 1);
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
}
