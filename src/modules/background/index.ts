import 'reflect-metadata';

import {container} from 'tsyringe';
import {Logster} from '@core/logster.service';
import {BackgroundService} from './background.service';

const logster = new Logster('System');
const bgService = container.resolve<BackgroundService>(BackgroundService);
bgService.bootstrap().catch((...args) => logster.error(args));
