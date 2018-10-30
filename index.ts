import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Http, Headers } from '@angular/http';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import * as _ from 'underscore';
import { AccountService } from './account';

export interface MicroServiceAPIConfig {
    baseUrl: string
}

export const MICRO_API_CONF = new InjectionToken<MicroServiceAPIConfig>("microservice.api.config");


export abstract class Service{
    abstract act(microserviceName: string, methodName: string, id: string, param: any): Observable<any>;
}

@Injectable()
export class MicroserviceClient extends Service{
    private buildUrl: (string)=>string;
    constructor(private http: Http,
      private account: AccountService,
      @Inject(MICRO_API_CONF) apiConfig: MicroServiceAPIConfig){
      super();
      this.buildUrl = (microserviceName:string):string=>{
        return `${apiConfig.baseUrl}/_api/${microserviceName}`;
      };
    }
    act(microserviceName: string, methodName: string, id: any, param: any): Observable<any>{

        let rest_methods = ["get", "post", "delete", "patch"], self = this;

        function is_rest() {
          return !_.isUndefined(_.find(rest_methods, n=>n==methodName.toLowerCase()));
        }

        function get_resource_name(): string {
	  return ((arrs)=>{
	    return arrs.length == 1 ? arrs[0] : arrs[1];
	  })(microserviceName.split(':'));
	}

       function get_microservice_name(): string{
         return ((arrs)=>{
	   return arrs[0];
	 })(microserviceName.split(':'));
       }
       
        function build_rest_url() {
          return ((dict)=>{
	    return dict[methodName.toLowerCase()]();
	  })(
	  {
            "get": function(){
	      return id ? `${self.buildUrl(get_microservice_name())}/${get_resource_name()}/${id}` : `${self.buildUrl(get_microservice_name())}/${get_resource_name()}`;
	    },
	    "post": function(){
              return `${self.buildUrl(get_microservice_name())}/${get_resource_name()}`;
            },
	    "delete": function(){
              return `${self.buildUrl(get_microservice_name())}/${get_resource_name()}/${id}`;
            },
	    "patch": function(){
	      return `${self.buildUrl(get_microservice_name())}/${get_resource_name()}/${id}`;
            }
          }
	  );
        }

        let rest_actions = {
          "get": function(){
            return self.http.get(build_rest_url(), {
	      headers: new Headers({
		       "name": self.account.getName(),
		       "token": self.account.getToken()
		     })
	    });
          },
	  "post": function(){
	    return self.http.post(build_rest_url(), param, {
	      "headers": new Headers({
		       "name": self.account.getName(),
		       "token": self.account.getToken()
		     })
	    });
	  },
	  "delete": function(){
	    return self.http.delete(build_rest_url(), {
	      "headers": new Headers({
		       "name": self.account.getName(),
		       "token": self.account.getToken()
		     })
	    });
	  },
	  "patch": function(){
	    return self.http.patch(build_rest_url(), param, {
	      "headers": new Headers({
		       "name": self.account.getName(),
		       "token": self.account.getToken()
		     })
	    });
	  }
        };

        return is_rest() ? new Observable<any>((observer: Observer<any>)=>{
	  rest_actions[methodName.toLowerCase()]().
	    subscribe(res=>{
              observer.next("_body" in res ? JSON.parse(res["_body"]) : res);
	    });
	  
	}) :
	    new Observable<any>((observer: Observer<any>)=>{
	      self.http.post(`${self.buildUrl(microserviceName)}/act`, {
		action: methodName,
		param: param
		},
		{
		  "headers": new Headers({
		    "name": self.account.getName(),
		    "token": self.account.getToken()
		  })
		}).subscribe((res)=>{
                     observer.next("_body" in res ? JSON.parse(res["_body"]) : res);
	        });
	});

    }
}

export function useService(service: Service, microserviceName: string): (string)=>(any)=>Observable<any>{
    return (methodName: string): (any)=>Observable<any> =>{
        return (param: any): Observable<any> =>{
	    let getp = _.propertyOf(param);
	    return service.act(microserviceName, methodName, getp("id") ? getp("id") : param, getp("param") ? getp("param") : param);
        };
    };
}

export { AccountService } from './account';