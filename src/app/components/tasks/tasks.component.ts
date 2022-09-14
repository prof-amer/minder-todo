import { Component, OnInit } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from './Task'

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  isLoading: boolean = false;
  tasks: Task[] = [];

  constructor(
    private tasksService: TasksService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.tasksService.getTasks().subscribe(
      (response: Task[]) => {
        this.tasks = response;
        this.isLoading = false;
        console.log(this.tasks);
      }
    )
  }

}
