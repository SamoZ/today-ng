import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './summary.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { SummaryRoutingModule } from './summary-routing.module';
import { SummaryService } from './summary.service';

@NgModule({
  declarations: [SummaryComponent],
  imports: [
    CommonModule,
    SummaryRoutingModule,
    NgZorroAntdModule
  ],
  providers: [SummaryService]
})
export class SummaryModule { }
