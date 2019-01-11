import { Injectable, InjectionToken, Inject } from '@angular/core';
import { MicroserviceAPIConfig } from './microservice_api_config'

export const MICRO_API_CONF = new InjectionToken<MicroserviceAPIConfig>("microservice.api.config");