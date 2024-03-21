import { Component, OnInit } from '@angular/core';
import {AmChartsService, AmChart} from '@amcharts/amcharts3-angular';
import {DashboardService} from '../../services/dashboard.service'

@Component({
  selector: 'portfolio-graph',
  templateUrl: './portfolio-graph.component.html',
  styleUrls: ['./portfolio-graph.component.css']
})
export class PortfolioGraphComponent implements OnInit {

	private chartData : any = [];
	private chart:AmChart;
  constructor(
  	private AmCharts : AmChartsService,
  	private dashboardService : DashboardService
  ) {
  	this.generateChartData = this.generateChartData.bind(this)
  	this.setChartData = this.setChartData.bind(this)
  	this.generateChart = this.generateChart.bind(this)
  	this.dashboardService.serviceStatus$.subscribe(status => {
  		if (status == 'ready') {
  			let tokens = this.dashboardService.getTokens()
  			try {
  				this.chartData = this.generateChartData(tokens);
  				this.setChartData()	
  			} catch(err) {
  				console.log(err)
  			}
  		}
  	})
  }
  setChartData() {
    if (this.chart) {
      this.chart.dataSets[0].dataProvider = this.chartData
    this.chart.validateData()  
    }
  	
  }
  generateChartData(tokens) {
  	let tokenAndExchange = Object.keys(tokens)
  	let dataLength = tokens[tokenAndExchange[0]].usd ? tokens[tokenAndExchange[0]].usd.length : 121
  	// calculate usd total for each data point
  	let graphData = new Array(dataLength)
  	for (let i = 0; i < dataLength; i++) {
  		let total = 0;
  		tokenAndExchange.forEach(jt => {
  			if (!tokens[jt].usd)
  				return;
  			if (!graphData[i]) {
					graphData[i] = {
	  				date : new Date(tokens[jt].usd[i].date),
	  				value : 0
	  			}
				}
				graphData[i].value += tokens[jt].usd[i].value * tokens[jt].tokenBalance
				// if (!graphData[i].value) {
				// 	graphData[i].value += Math.random() * 10
				// }
  		})
  	}
  	return graphData;
  }
  generateChart() {
  	this.chart = this.AmCharts.makeChart("porfolio-glance", {
		  type: 'stock',
		  theme: 'dark',
		  marginRight: 80,
		  dataSets: [{
	      fieldMappings: [{
          fromField: 'value',
          toField: 'value'
        }],
	      dataProvider: this.chartData,
	      categoryField: 'date'
	    }],
		  panels: [{
	      stockGraphs: [{
          id: 'g1',
          lineThickness: 2,
          fillAlphas: 0.4,
          valueField: 'value',
          useDataSetColors: false
        }]
	    }],
		  panelSettings: {
		    marginLeft: 300,
		    marginTop: 5,
		    marginBottom: 5
		  },
		  chartScrollbarSettings: {
		    enabled: false
		  },
		  chartCursorSettings: {
		    valueBalloonsEnabled: true,
		    fullWidth: true,
		    cursorAlpha: 0.1,
		    valueLineBalloonEnabled: true,
		    valueLineEnabled: true,
		    valueLineAlpha: 0.5
		  }
		});
  }
  ngOnInit() {
  	this.generateChart()
  }
}