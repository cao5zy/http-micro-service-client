# http micro-service client

This is a typescript library for AngularJs2 to invoke REST APIs of microservices through microservice gateway.    

## Installation

    npm install http-micro-service-front --save

## Precondition

It assumes that the service url has the following pattern:  
*REST pattern: http://host:port/_api/service_name/resource_name  

Let's assume that there is a resource `specialists` associated with a RESTful microservice `people_service`. The example below will show how to post, get, put and delete the individual `specialist` data through `http-micro-service-front` as well as other interactions.

## Pre-configure your code to use `http-micro-service-front`
app.module.ts
```
...
import { AccountService, MICRO_API_CONF, MicroserviceClient, Service } from 'http-micro-service-front';
...

@NgModule({
  declarations: [
    AppComponent,
    ...
  ],
  imports: [
    HttpModule,
    BrowserModule,
    ...
  ],
  bootstrap: [AppComponent],
  providers: [{
    provide: MICRO_API_CONF,
    useValue: {
      baseUrl: environment.baseUrl
      }
    },
    {provide: Service, useClass: MicroserviceClient},
  ...
  ]
})
export class AppModule { }
```
environment.ts
```
export const environment = {
  production: false,
  baseUrl: "http://127.0.0.1:9008"
};
```
The `Service` is setup as the root module not only because it can be used over the components but also because it is designed as an layer under the components for transport and has following APIs to interact.
- get
- post
- put
- delete
- loading
- loaded
- auth_err

## Get/Post/Put/Delete
```
import { useService, Service } from 'http-micro-service-front';
import { Specialist } from './../models';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.css']
})
export class SpecialistComponent implements OnInit {
  _specialistService : any = null;
  ...
  
  constructor(private _service: Service) {
    this._specialistService = useService(this._service, 'people_service:specialist');
  }

  get_specialist(id: string): Observable<Specialist> {
    return this._specialistService('get')({id: id})
  }

  post_specialist(specialist: Specialist) : void {
    this._specialistService('post')(specialist);
  }

  put_specialist(specialist: Specialist) : void {
    this._specialistService('put')({id: specialist.id, param: specialist})
    .subscribe(res => {});
  }

  delete_specialist(id: string) : void {
    this._specialistService('delete')({id: id})
    .subscribe(res => {});
  }  

```

## Query with Get
It is possible that complex query is required. 
```
this._speicalistsService('get')({name: 'alan', 'addr': 'addr1'})
.subscribe(res => {

  });
```
The parameters above will be converted to querystring as `?name=alan&addr=addr1`.

## Interactions with loading/loaded
Because the `Service` object has been injected at the root, it can be used anywhere in the component.
So we can easily take advantages of the api `loading` and `loaded` to show and close the loading layer.
```
ngOnInit() {
  this._service.loading()
  .subscribe(res => {
    // show your loading layer
    });

  this._service.loaded()
  .subscribe(res => {
    // hide your loading layer
    });
}

```

## Interactions with auth_err
We can handle the authorization error globally in architecture level without impact the business code with the api `auth_err`.
```
ngOnInit() {
  this._service.auth_err()
  .subscribe( res => {
    this._alerts.push(res);
    });
}

```

This library is designed as part of microservices platform solution. It aims to combine the front end application with the backend microservices seamlessly. Any comments and [issues](https://github.com/cao5zy/http-micro-service-client/issues) are welcomed.
Please feel free to contact me at <zongying_cao@163.com>.





