import { Component, OnInit } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from './Task'
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  form !: FormGroup;
  isLoading: boolean = false;
  notStarted: Task[] = [];
  inProgress: Task[] = [];
  completed: Task[] = [];


  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder
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

    this.form = this.fb.group({
      name: this.fb.control(null, [Validators.required]),
      description: this.fb.control(null),
      status: this.fb.control(null, [Validators.required]),
      dueDate: this.fb.group({
        date: this.fb.control(null),
        time: this.fb.control(null),
      })
    });
  }

  submit(formDirective: FormGroupDirective) {
    this.submitTask();
    formDirective.resetForm();
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

  deleteTask(tasks: Task[],index: number){
    tasks.splice(index, 1);
  }

  editTask(tasks: Task[], index: number){

  }

  submitTask() {
    this.isLoading = true;
    const createdAt = new Date().toISOString();
    const {name, description, status} = this.form.value;
    let dueDate = this.form.get('dueDate')?.value;
    if (dueDate.time) {
      const [hh, mm] = dueDate.time.split(':');
      dueDate.date.hour(hh);
      dueDate.date.minute(mm);
    }
    dueDate = dueDate.date.toISOString();
    switch (status) {
      case 'NotStarted':
        this.notStarted.push({name, description, status, createdAt, dueDate})
        break
      case 'InProgress':
        this.inProgress.push({name, description, status, createdAt, dueDate})
        break
      case 'Completed':
        this.completed.push({name, description, status, createdAt, dueDate})
        break
      default:
      // error handling
    }
    this.isLoading = false;
  }

}
