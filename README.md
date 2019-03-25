# http micro-service client

This is a typescript library for AngularJs2 to invoke REST APIs of microservices through microservice gateway.    

## Installation

    npm install http-micro-service-front --save

## Precondition

It assumes that the service url has the following tow patterns:  
*REST pattern: http://host:port/_api/service_name/resource_name  

Let's assumes there is a resource `specialists` associated with a RESTful microservice `people_service`. The example below will show how to post, get, put and delete the individual `specialist` data through `http-micro-service-front`.

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
Let's assume that the `service_name` is `` and the `resource_name` is `interface`.
Import the types to your file.

    import { useService, Service, AccountService } from 'seneca_client_for_ng2'
   
Initialize the service object.

    private senecaClient : any = null;  
    constructor(private service: Service
    ){
        this.senecaClient = useService(this.service, "interface_service");
    }

Post data to service. 

    private loadData(){
        let param = {};
        this.senecaClient("post")({param: this.appModuleview}));
	    .subscribe(res=>{
            console.log(res);
	    // your code for handling data is here.
        });
    }

That's all for use the code. In the code above, you are responsible to take care of four things:
1. *this.service*
2. *name_of_your_service*
3. *methodname*
4. *param*

I will explain them one by one.

### this.service  

"this.service" is an injectable AngularJs2 service object. It is initialized by *MicroserviceClient* class.  

    import { Service, MicroserviceClient } from 'seneca_client_for_ng2';
    ...
    providers: [{provide: Service, useClass: MicroserviceClient}]

In this way, you can easily mock the *Service* in your unit test.  
To initialize *MicroserviceClient* object, you have to specify an InjectionToken.  

    import { MICRO_API_CONF, Service, MicroserviceClient } from 'seneca_client_for_ng2';
    ...
    providers: [
        {provide: MICRO_API_CONF, useValue: { baseurl: "http://host:port" }}, 
	    {provide: Service, useClass: MicroserviceClient }
	]

### name_of_your_service

The pre-condition of this library is assuming that your microservice instances is deployed behind a proxy. Each microservice instance has its own unique name in the url.  
For example, name_of_your_service is interface_service. Then the generated url is as following.

    http://baseUrl/_api/interface_service/act







