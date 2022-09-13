import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TasksService extends HttpClient {

  getTasks(){
    return this.get('https://demo.minder.care/interview/task')
  }

}
