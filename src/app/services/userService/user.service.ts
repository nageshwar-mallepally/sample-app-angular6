import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.baseUrl;

  constructor(private http:HttpClient) {
  }

  getallUsers():Observable<any> {
    return this.http.get(this.baseUrl + 'api/user/all')
  }

  getById(id:number):Observable<any> {
    return this.http.get(this.baseUrl + 'api/user/' + id);
  }

  createUser(ob):Observable<any> {
    let body = JSON.stringify(ob);
    let options = {headers: new HttpHeaders().set('Content-Type', 'application/json')};
    return this.http.post(this.baseUrl + 'api/auth/signup', body, options);
  }

  updateUser(id:number, ob):Observable<any> {
    let body = JSON.stringify(ob);
    let options = {headers: new HttpHeaders().set('Content-Type', 'application/json')};
    return this.http.put(this.baseUrl + 'api/user/' + id, body, options);
  }

  deleteUser(id:number):Observable<any> {
    return this.http.delete(this.baseUrl + 'api/user/' + id);
  }

  getallRoles():Observable<any> {
    return this.http.get(this.baseUrl + 'api/roles/all')
  }

  getMultipleObjectsByType(ids:any, type) {
    var url = this.baseUrl + "api/objects/multiple/[" + ids + "]?type=" + type;
    return this.http.get(url);
  }

  getUsersByIds(ids:any) {
    var url = this.baseUrl + "api/user/multiple/[" + ids + "]";
    return this.http.get(url);
  }

  getUserReferences(objects:any, property:any) {
    objects.forEach(object => {
      console.log(object[property]);
      if (object[property] != null) {
       let userId = object[property];
        this.getById(userId).subscribe((user)=> {
          console.log(user);
          object[property + "Object"] = user;
          console.log(object[property + "Object"]);
        })
      }
    });

      /*this.getUsersByIds(userIds).subscribe((users:any)=> {
       let map = new Map();
       users.find((user)=>map.set(user.id, user));

       objects.forEach(object => {
       if (object[property] != null) {
       let login = map.get(object[property]);
       if (login != null) {
       object[property + "Object"] = login;
       }
       }
       })
       })*/
    /*let userIds = [];
    objects.forEach(object => {
      console.log(object[property]);
      if (object[property] != null && userIds.indexOf(object[property]) == -1) {
        userIds.push(object[property]);
      }
    });
    if (userIds.length > 0) {
      let map = new Map();
      userIds.forEach(userId => {
        this.getById(userId).subscribe((user)=> {
          map.set(userId, user)
        })
        })
      objects.forEach(object => {
        if (object[property] != null) {
          let login = map.get(object[property]);
          if (login != null) {
            object[property + "Object"] = login;
          }
        }
      })


      /!*this.getUsersByIds(userIds).subscribe((users:any)=> {
       let map = new Map();
       users.find((user)=>map.set(user.id, user));

       objects.forEach(object => {
       if (object[property] != null) {
       let login = map.get(object[property]);
       if (login != null) {
       object[property + "Object"] = login;
       }
       }
       })
       })*!/
    }*/
  }

  getObjectReferences(objects:any, type:any, property:any) {
    let objectIds = [];
    objects.forEach(object => {
      if (object[property] != null && objectIds.indexOf(object[property]) === -1) {
        objectIds.push(object[property]);
      }
    })

    if (objectIds.length > 0) {
      this.getMultipleObjectsByType(objectIds, type).subscribe((results:any) => {
        let map = new Map();
        results.find((result) => map.set(result.id, result))
        objects.forEach(object => {
          if (object[property] != null) {
            let o = map.get(object[property]);
            if (o != null) object[property + "Object"] = o;
          }
        })
      })
    }
  }
}
