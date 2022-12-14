import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Task } from './Task';

@Injectable({
  providedIn: 'root',
})
export class TasksService extends HttpClient {
  private api = environment.api;

  getTasks(): Observable<Task[]> {
    return this.get<Task[]>(this.api);
  }

  // mock save to db
  saveToDatabase(notStarted: Task[], inProgress: Task[], completed: Task[]) {
    localStorage.setItem('notStarted', JSON.stringify(notStarted));
    localStorage.setItem('inProgress', JSON.stringify(inProgress));
    localStorage.setItem('completed', JSON.stringify(completed));
  }
}
