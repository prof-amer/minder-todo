import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.css'],
})
export class NewTaskComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data.dueDate) {
      this.data.date = DateTime.fromISO(this.data.dueDate).toISODate();
      this.data.dueTime = DateTime.fromISO(this.data.dueDate).toLocaleString(
        DateTime.TIME_SIMPLE
      );
    }
    this.form = this.fb.group({
      name: this.fb.control(this.data.name || null, [Validators.required]),
      description: this.fb.control(this.data.description || null),
      status: this.fb.control(this.data.status || null, [Validators.required]),
      dueDate: this.fb.group({
        date: this.fb.control(this.data.date || null),
        time: this.fb.control(this.data.dueTime || null),
      }),
    });
    if (this.data.dueTime) {
      this.form.get('dueDate.date')?.setValidators([Validators.required]);
    }
  }

  submit(formDirective: FormGroupDirective) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitTask();
    this.dialogRef.close();
    formDirective.resetForm({});
  }

  editTask(formDirective: FormGroupDirective) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const createdAt = this.data.createdAt;
    const [name, description, status, dueDate] = this.parseForm();
    const previousStatus = this.data.updateGroup[this.data.updateID].status;
    if (this.data.updateID !== null && this.data.updateID !== undefined) {
      this.data.updateGroup[this.data.updateID] = {
        name,
        description,
        status,
        dueDate,
        createdAt,
      };
    }
    if (status !== previousStatus) {
      switch (status) {
        case 'NotStarted':
          this.data.notStarted.unshift(
            this.data.updateGroup[this.data.updateID]
          );
          break;
        case 'InProgress':
          this.data.inProgress.unshift(
            this.data.updateGroup[this.data.updateID]
          );
          break;
        case 'Completed':
          this.data.completed.unshift(
            this.data.updateGroup[this.data.updateID]
          );
          break;
      }
      this.data.updateGroup.splice(this.data.updateID, 1);
    }
    localStorage.setItem('notStarted', JSON.stringify(this.data.notStarted));
    localStorage.setItem('inProgress', JSON.stringify(this.data.inProgress));
    localStorage.setItem('completed', JSON.stringify(this.data.completed));
    this.dialogRef.close();
    formDirective.resetForm({});
  }

  submitTask() {
    const createdAt = new Date().toISOString();
    const [name, description, status, dueDate] = this.parseForm();
    switch (status) {
      case 'NotStarted':
        this.data.notStarted.push({
          name,
          description,
          status,
          createdAt,
          dueDate,
        });
        localStorage.setItem(
          'notStarted',
          JSON.stringify(this.data.notStarted)
        );
        break;
      case 'InProgress':
        this.data.inProgress.push({
          name,
          description,
          status,
          createdAt,
          dueDate,
        });
        localStorage.setItem(
          'inProgress',
          JSON.stringify(this.data.inProgress)
        );
        break;
      case 'Completed':
        this.data.completed.push({
          name,
          description,
          status,
          createdAt,
          dueDate,
        });
        localStorage.setItem('completed', JSON.stringify(this.data.completed));
        break;
    }
  }

  parseForm() {
    const { name, description, status } = this.form.value;
    let dueDate = this.form.get('dueDate')?.value;
    if (dueDate.date) {
      dueDate.date = DateTime.fromFormat(dueDate.date, 'yyyy-MM-dd');
      if (dueDate.time) {
        const [hh, mm] = dueDate.time.split(':');
        dueDate.date = dueDate.date.set({ hour: hh, minute: mm });
      }
      dueDate = dueDate.date.toUTC().toISO();
      return [name, description, status, dueDate];
    }
    return [name, description, status, null];
  }

  // set date as required when time is set
  // prevent time without date which is invalid
  setDateRequired() {
    if (this.form.get('dueDate.time')?.value) {
      this.form.get('dueDate.date')?.setValidators([Validators.required]);
      this.form.get('dueDate.date')?.updateValueAndValidity();
      this.form.get('dueDate.date')?.markAsTouched();
    } else {
      this.form.get('dueDate.date')?.removeValidators([Validators.required]);
      this.form.get('dueDate.date')?.updateValueAndValidity();
    }
  }
}
