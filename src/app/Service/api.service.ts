import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  post(endPoint,obj){
    try{
      return this.http.post("http://localhost:3000/api/"+endPoint,obj);
    }catch(err){
      console.log(err.message);
      return err.message;
    }
  }
  get(endPoint,obj){
    try{
      return this.http.get("http://localhost:3000/api/"+endPoint,obj);
    }catch(err){
      console.log(err.message);
      return err.message;
    }
  }
}
