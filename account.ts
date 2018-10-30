import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AccountService {
  project: string = "";
  private userName: string = "";
  private token: string = "";
  statusChanged = new EventEmitter<string>(); //params account_changed
  
  constructor(){}

  reset() {
    this.set();
  }

  getName():string {
    return this.userName;
  }

  getToken():string {
    return this.token;
  }

  set(userName: string = "", token: string = ""){
    this.userName = token && token.length != 0 ? userName : "";
    this.token = typeof token == 'undefined' ? "": token;
    this.statusChanged.next("account_changed");
  }

  hasToken(): boolean {
    return this.token && this.token.length != 0;
  }

}