import {ResultObject} from '../common/common.interface';
import {ScheduleEntity} from './schedule.entity';

export interface SchedulesRO extends ResultObject {
  schedules?: ScheduleEntity[];
}

export interface ScheduleRO extends ResultObject {
  schedule?: ScheduleEntity;
}
