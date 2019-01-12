import { Injectable, Inject, EventEmitter } from '@angular/core';
import { MICRO_API_CONF } from './micro_api_conf';
import { MicroserviceAPIConfig } from './microservice_api_config';
import { Http } from '@angular/http';

@Injectable()
export class AccountService {
  project: string = "";
  private userName: string = "";
  private token: string = "";
  statusChanged = new EventEmitter<string>(); //params account_changed
  private _baseUrl: string = "";
  
  constructor(@Inject(MICRO_API_CONF) apiConfig: MicroserviceAPIConfig,
    private _http: Http
  ){
    this._baseUrl = apiConfig.baseUrl;
  }

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

  signup(name: string, pwd: string) : Promise<string> {
    return new Promise<string>((resolve, reject)=>{
       this._http.post(this._baseUrl + '/signup', {name: name, pwd: pwd})
	 .subscribe(res=>{
	   if (res.status == 201)
	   {
	     resolve(res['_body'] as string);
	   }
	   else
	   {
	     reject('error happened');
	   }
	 });
     });
  }

  signin(name: string, pwd: string): Promise<string> {
    return new Promise<string>((resolve, reject)=>{
      this._http.post(this._baseUrl + '/signin', {name: name, pwd: pwd})
      .subscribe(res=>{
        if (res.status == 200 )
	{
	  resolve(res['_body'] as string);
	}
	else
	{
	  reject('authentication failed');
	}
	
      });
    });
  }
}