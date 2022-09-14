import { Component, OnInit } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from './Task'
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  isLoading: boolean = false;
  notStarted: Task[] = [];
  inProgress: Task[] = [];
  completed: Task[] = [];


  constructor(
    private tasksService: TasksService
  ) {}

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

}
