import 'reflect-metadata';
import {container} from 'tsyringe';
import {ContentScriptService} from './content-script.service';

const contentScriptService = container.resolve(ContentScriptService);
contentScriptService.checkForLoginToken();
