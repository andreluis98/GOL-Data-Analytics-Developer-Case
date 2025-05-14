import { Component, Input, OnInit } from '@angular/core';
import { ChartData } from '../models/chart-data/chart-data.model';
import { ApexChart, NgApexchartsModule } from 'ng-apexcharts';
@Component({
  selector: 'app-chart',
  imports: [NgApexchartsModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {

  @Input() data: ChartData | undefined;
  @Input() color: string | undefined;

  public chartOptions: Partial<ApexChart> | any = {};

  ngOnInit(): void {
    this.graphs();
  }

  graphs() {
    if (this.data) {
      this.chartOptions = {
        chart: {
          toolbar: {
            show: false,
          },
          type: 'bar',
          height: 315
        },
        series: [{
          name: 'Passageiros',
          data: this.data.data
        }],
        xaxis: {
          categories: this.data.labels
        },
        colors: [this.color],
        title: {
          align: 'center'
        },
        tooltip: {
          enabled: true
        },
        dataLabels: {
          enabled: false
        }
      }
    };
  }
}
