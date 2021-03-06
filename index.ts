import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { EventEmitter } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import * as _ from 'underscore';
import { AccountService } from './account';
import { MICRO_API_CONF } from './micro_api_conf';
import { MicroserviceAPIConfig } from './microservice_api_config';
import { encodeQuerystring } from './querystring';

export abstract class Service {
    abstract act(microserviceName: string, methodName: string, id: string, param: any): Observable<any>;
    abstract loading(): EventEmitter<any>;
    abstract loaded(): EventEmitter<any>;
    abstract auth_err(): EventEmitter<{resource: string, action: string}>;
}

@Injectable()
export class MicroserviceClient extends Service {
    private buildUrl: (string) => string;
    constructor(private http: Http,
      private account: AccountService,
      @Inject(MICRO_API_CONF) apiConfig: MicroserviceAPIConfig) {
      super();
      this.buildUrl = (microserviceName: string): string => {
        return `${apiConfig.baseUrl}/_api/${microserviceName}`;
      };
    }
    private _loading: EventEmitter<any> = new EventEmitter<any>();
    private _loaded: EventEmitter<any> = new EventEmitter<any>();
    _auth_err: EventEmitter<{resource: string; action: string}> = new EventEmitter<{resource: string; action: string}>();

    auth_err(): EventEmitter<{resource: string; action: string}> {
      return this._auth_err;
    }
    loading(): EventEmitter<any> {
      return this._loading;
    }
    
    loaded(): EventEmitter<any> {
      return this._loaded;
    }

    act(microserviceName: string, methodName: string, id: any, param: any): Observable<any> {

        const rest_methods = ['get', 'post', 'delete', 'patch', 'put'], self = this;

        function is_rest() {
          return !_.isUndefined(_.find(rest_methods, n => n === methodName.toLowerCase()));
        }

        function get_resource_name(): string {
	  return ((arrs) => {
	    return arrs.length === 1 ? arrs[0] : arrs[1];
	  })(microserviceName.split(':'));
	}

       function get_microservice_name(): string {
         return ((arrs) => {
	   return arrs[0];
	 })(microserviceName.split(':'));
       }
       
        function build_rest_url() {
          return ((dict) => {
	    return dict[methodName.toLowerCase()]();
	  })(
	  {
            'get': function() {
	      return id
	        ? `${self.buildUrl(get_microservice_name())}/${get_resource_name()}/${id}`
		: `${self.buildUrl(get_microservice_name())}/${get_resource_name()}${encodeQuerystring(param) === null
		  ? ''
		  : '?' + encodeQuerystring(param)}`;
	    },
	    'post': function() {
              return `${self.buildUrl(get_microservice_name())}/${get_resource_name()}`;
            },
	    'delete': function() {
              return `${self.buildUrl(get_microservice_name())}/${get_resource_name()}/${id}`;
            },
	    'patch': function() {
	      return `${self.buildUrl(get_microservice_name())}/${get_resource_name()}/${id}`;
            },
	    'put': function() {
	      return `${self.buildUrl(get_microservice_name())}/${get_resource_name()}/${id}`;
	    }
          }
	  );
        }

        const rest_actions = {
          'get': function() {
            return self.http.get(build_rest_url(), {
	      headers: new Headers({
		       'name': self.account.getName(),
		       'token': self.account.getToken()
		     })
	    });
          },
	  'post': function() {
	    return self.http.post(build_rest_url(), param, {
	      'headers': new Headers({
		       'name': self.account.getName(),
		       'token': self.account.getToken()
		     })
	    });
	  },
	  'delete': function() {
	    return self.http.delete(build_rest_url(), {
	      'headers': new Headers({
		       'name': self.account.getName(),
		       'token': self.account.getToken()
		     })
	    });
	  },
	  'patch': function() {
	    return self.http.patch(build_rest_url(), param, {
	      'headers': new Headers({
		       'name': self.account.getName(),
		       'token': self.account.getToken()
		     })
	    });
	  },
	  'put': function() {
	    return self.http.put(build_rest_url(), param, {
	      'headers': new Headers({
		       'name': self.account.getName(),
		       'token': self.account.getToken()
		     })
	    });
	  }
	  
        };

        this._loading.emit(null);
        return is_rest() ? new Observable<any>((observer: Observer<any>) => {
	  rest_actions[methodName.toLowerCase()]().
	    subscribe(res => {
              observer.next('_body' in res ? JSON.parse(res['_body']) : res);
              this._loaded.emit(null);
	      observer.complete();
	    },
	    err => {
	      if (err.status === 401) {
	        this._auth_err.emit({resource: get_resource_name(), action: methodName.toLowerCase()});
              }
              this._loaded.emit(null);
	      observer.complete();
	      console.log(err);
	    },
	    () => {
    	      this._loaded.emit(null);
	      observer.complete();
	    });
	  
	}) :
	    new Observable<any>((observer: Observer<any>) => {
	      self.http.post(`${self.buildUrl(microserviceName)}/act`, {
		action: methodName,
		param: param
		},
		{
		  'headers': new Headers({
		    'name': self.account.getName(),
		    'token': self.account.getToken()
		  })
		}).subscribe((res) => {
                     observer.next('_body' in res ? JSON.parse(res['_body']) : res);
		     this._loaded.emit(null);
	        });
	});

    }
}

export function useService(service: Service, microserviceName: string): (string) => (any) => Observable<any> {
    return (methodName: string): (any) => Observable<any> => {
        return (param: any): Observable<any> => {
	    const getp = _.propertyOf(param);
	    return service.act(microserviceName, methodName, _.has(param, 'id')
	      ? getp('id')
	      : null, _.has(param, 'param') ? getp('param') : param);
        };
    };
}

export { AccountService } from './account';
export *  from './microservice_api_config';
export * from './micro_api_conf';
