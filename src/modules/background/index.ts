import 'reflect-metadata';

import {container} from 'tsyringe';
import {Logster} from '@core/logster';
import {BackgroundService} from './background.service';

const logster = new Logster('System');
const bgService = container.resolve(BackgroundService);
bgService.bootstrap().catch((...args) => logster.error(args));
