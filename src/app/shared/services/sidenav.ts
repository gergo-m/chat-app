import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private toggleSidenavSource = new Subject<void>();
  toggleSidenav$ = this.toggleSidenavSource.asObservable();

  toggle() {
    this.toggleSidenavSource.next();
  }
}
