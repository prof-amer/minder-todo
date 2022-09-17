import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.css']
})
export class NewTaskComponent implements OnInit {
  form !: FormGroup;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<NewTaskComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if (this.data.dueDate){
      this.data.dueTime = DateTime.fromISO(this.data.dueDate).toLocaleString(DateTime.TIME_SIMPLE)
    }
    this.form = this.fb.group({
      name: this.fb.control( this.data.name || null, [Validators.required]),
      description: this.fb.control(this.data.description || null),
      status: this.fb.control(this.data.status || null, [Validators.required]),
      dueDate: this.fb.group({
        date: this.fb.control(this.data.dueDate || null),
        time: this.fb.control( this.data.dueTime || null),
      })
    });
  }

  submit(formDirective: FormGroupDirective) {
    this.submitTask();
    this.dialogRef.close();
    formDirective.resetForm({})
  }

  editTask(formDirective: FormGroupDirective) {
    this.isLoading = true;
    const {name, description, status} = this.form.value;
    const createdAt = this.data.createdAt
    let dueDate = this.form.get('dueDate')?.value.toISOString();
    if (this.data.updateID!== undefined && this.data.updateID !== null){
      this.data.updateGroup[this.data.updateID] = {name, description, status, dueDate, createdAt}
    }
    this.dialogRef.close();
    formDirective.resetForm({})
    this.isLoading = false;
  }

  submitTask() {
    this.isLoading = true;
    const createdAt = new Date().toISOString();
    const {name, description, status} = this.form.value;
    let dueDate = this.form.get('dueDate')?.value;
    if (dueDate.time) {
      const [hh, mm] = dueDate.time.split(':');
      dueDate.date =  dueDate.date.set({hour: hh, minute: mm})
    }
    dueDate = dueDate.date.toUTC().toISO()
    switch (status) {
      case 'NotStarted':
        this.data.notStarted.push({name, description, status, createdAt, dueDate})
        break
      case 'InProgress':
        this.data.inProgress.push({name, description, status, createdAt, dueDate})
        break
      case 'Completed':
        this.data.completed.push({name, description, status, createdAt, dueDate})
        break
      default:
      // error handling
    }
    this.isLoading = false;
  }

}
