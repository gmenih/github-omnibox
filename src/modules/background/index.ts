import 'reflect-metadata';
import {container} from 'tsyringe';
import {BackgroundService} from './background.service';

container.resolve(BackgroundService).bootstrap();
