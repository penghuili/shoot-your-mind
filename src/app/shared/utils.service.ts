import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {
  createUUID() {
    return "sym" + (new Date()).getTime();
  }
}
