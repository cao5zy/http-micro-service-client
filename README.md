# Seneca Client For Ng2

This is a typescript library for AngularJs2 to invoke methods of microservices through microservice gateway.    

## Installation

    npm install seneca_ng2_client --save

## Precondition

It assumes that the service url has the following tow patterns:  
*REST pattern: http://host:port/_api/service_name/resource_name  
*Seneca pattern: http://host:port/_api/service_name/act  

## Use it REST pattern
Let's assume that the `service_name` is `interface_service` and the `resource_name` is `interface`.
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


### methodName

The name of the method defined at your microservice end. It assumes your method defined as following based on seneca framework:  

    seneca.add({action: "methodName"}, function(msg, respond){
        ....
    }

### param

The param means the parameter objects, values should be in {}. It assumes your method defined as following based on seneca framework:  

    seneca.add({action: "methodName"}, function(msg, respond){
        let param = msg.param;
	...
    }





