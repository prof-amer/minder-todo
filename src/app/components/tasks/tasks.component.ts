import { Component, OnInit } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from './Task'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as moment from 'moment';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  form !: FormGroup;
  editMode: boolean = false;
  isLoading: boolean = false;
  notStarted: Task[] = [];
  inProgress: Task[] = [];
  completed: Task[] = [];
  updateID: number | undefined;
  updateGroup: Task[] = [];


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

  submit() {
    this.submitTask();
    this.form.reset()
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
    const {name, description, status, dueDate} = tasks[index]
    if (dueDate) {
      const newDate = moment(dueDate);
      const newTime = newDate.hour() + ':' + (newDate.minute() === 0 ? '00' : newDate.minute())
      this.form.patchValue({
        name,
        description,
        status,
        dueDate: {
          date: newDate,
          time: newTime
        }
      })
    }
  }

  editTask() {
    this.isLoading = true;
    const {name, description, status} = this.form.value;
    let dueDate = this.form.get('dueDate')?.value;
    if (dueDate.time) {
      const [hh, mm] = dueDate.time.split(':');
      dueDate.date.hour(hh);
      dueDate.date.minute(mm);
    }
    dueDate = dueDate.date.toISOString();
    console.log(name, description, status, dueDate, this.updateID)
    if (this.updateID!== undefined && this.updateID !== null){
      console.log(this.updateGroup[this.updateID])
      this.updateGroup[this.updateID] = {name, description, status, dueDate}
    }
    this.form.reset();
    this.isLoading = false;
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
