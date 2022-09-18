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
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    if (this.data.dueDate) {
      this.data.date = DateTime.fromISO(this.data.dueDate)
      this.data.dueTime = DateTime.fromISO(this.data.dueDate).toLocaleString(DateTime.TIME_SIMPLE)
    }
    this.form = this.fb.group({
      name: this.fb.control(this.data.name || null, [Validators.required]),
      description: this.fb.control(this.data.description || null),
      status: this.fb.control(this.data.status || null, [Validators.required]),
      dueDate: this.fb.group({
        date: this.fb.control(this.data.date || null),
        time: this.fb.control(this.data.dueTime || null),
      })
    });
  }

  submit(formDirective: FormGroupDirective) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitTask();
    this.dialogRef.close();
    formDirective.resetForm({})
  }

  editTask(formDirective: FormGroupDirective) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const createdAt = this.data.createdAt
    const [name, description, status, dueDate] = this.parseForm()
    if (this.data.updateID !== undefined && this.data.updateID !== null) {
      this.data.updateGroup[this.data.updateID] = {name, description, status, dueDate, createdAt}
    }
    this.dialogRef.close();
    formDirective.resetForm({})
    this.isLoading = false;
  }

  submitTask() {
    this.isLoading = true;
    const createdAt = new Date().toISOString();
    const [name, description, status, dueDate] = this.parseForm()
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

  parseForm() {
    const {name, description, status} = this.form.value;
    let dueDate = this.form.get('dueDate')?.value;
    if (dueDate.date !== null && dueDate.date !== undefined) {
      dueDate.date = DateTime.fromISO(dueDate.date)
      if (dueDate.time !== null && dueDate.time !== undefined) {
        const [hh, mm] = dueDate.time.split(':');
        dueDate.date = dueDate.date.set({hour: hh, minute: mm})
      }
      dueDate = dueDate.date.toUTC().toISO()
      return [name, description, status, dueDate]
    }
    return [name, description, status, null]
  }

  setDateRequired() {
    if (this.form.get('dueDate')?.get('time')?.value) {
      this.form.get('dueDate')?.get('date')?.setValidators([Validators.required])
      this.form.get('dueDate')?.get('date')?.updateValueAndValidity()
      this.form.get('dueDate')?.get('date')?.markAsTouched()
    } else {
      this.form.get('dueDate')?.get('date')?.removeValidators([Validators.required])
      this.form.get('dueDate')?.get('date')?.updateValueAndValidity()
    }
  }
}
