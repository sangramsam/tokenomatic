import { Component, OnInit } from '@angular/core';
import {AmChartsService, AmChart} from '@amcharts/amcharts3-angular';
import {DashboardService} from '../../services/dashboard.service'

@Component({
  selector: 'portfolio-breakdown',
  templateUrl: './portfolio-breakdown.component.html',
  styleUrls: ['./portfolio-breakdown.component.css']
})
export class PortfolioBreakdownComponent implements OnInit {

	private chartData : any = [];
	private chart:AmChart;
	private isComponentInitialized = false;
  constructor(
  	private AmCharts : AmChartsService,
  	private dashboardService : DashboardService
  ) {
  	this.generateChartData = this.generateChartData.bind(this)
  	this.generateChart = this.generateChart.bind(this)

  	this.dashboardService.serviceStatus$.subscribe(status => {
  		if (status == 'ready') {
  			let tokens = this.dashboardService.getTokens()
  			try {
  				this.chartData = this.generateChartData(tokens);
  				// This impl is slightly different from graph at glance.
  				// Here we need to add stock panels based on token data
  				// So we generate the graph every time we get token data
  				this.generateChart()
  			} catch(err) {
  				//console.log(err)
  			}
  		}
  	})
  }
  generateChartData(tokens) {

  	let sampleDataPointLength = 3
  	let topTokenNumber = 3
  	let dataPointLength = 10

  	// calculate usd value for each token for a sample period of 'sampleDataPointLength'
  	let tokenAndExchange = Object.keys(tokens)
  	let dataLength = tokens[tokenAndExchange[0]].usd ? tokens[tokenAndExchange[0]].usd.length : 121
  	let graphData = new Array(sampleDataPointLength)

  	for (let i = dataLength - sampleDataPointLength, t = 0; i < dataLength; i++, t++) {
  		let total = 0;
  		tokenAndExchange.forEach((jt, j) => {
  			if (!tokens[jt].usd)
  				return;
  			if (!graphData[t]) {
  				if (!tokens[jt].usd[i]) {
  					debugger
  					console.log(jt)
  					console.log(i)
  					console.log(tokens[jt])
  				}
					graphData[t] = {
	  				date : new Date(tokens[jt].usd[i].date),
	  			}
				}
				graphData[t][jt] = tokens[jt].usd[i].value * tokens[jt].tokenBalance
				// if (!graphData[t][jt]) {
				// 	graphData[t][jt] = Math.random() * 10
				// }
  		})
  	}
  	// Calculate the avg for each token for the period of 'sampleDataPointLength'
  	let lastNDataPoints = graphData.slice()
  	let topTokenList = []
  	Object.keys(lastNDataPoints[0]).forEach(it => {
  		if (it === 'date')
  			return
  		let total = 0
  		lastNDataPoints.forEach(dataPoint => {
  			total += dataPoint[it]
  		})
  		// avg for the period
  		total = total/lastNDataPoints.length
  		topTokenList.push({
  			token : it,
  			total
  		})
  	})

  	topTokenList.sort((a, b) => {
  		return b.total - a.total
  	})
  	// Get the top 'topTokenNumber' by avg usd value
  	topTokenList = topTokenList.slice(0, topTokenNumber)


  	// calculate usd total for each data point from 'topTokenList'
  	graphData = new Array(dataPointLength)
  	for (let i = dataLength - 10, t = 0; i < dataLength; i++, t++) {
  		let total = 0;
  		topTokenList.forEach((jt, j) => {
  			let symbol = jt.token
  			if (!tokens[symbol].usd)
  				return;
  			if (!graphData[t]) {
					graphData[t] = {
	  				date : new Date(tokens[symbol].usd[i].date),
	  			}
				}
				graphData[t][symbol] = tokens[symbol].usd[i].value * tokens[symbol].tokenBalance
				// if (!graphData[t][jt]) {
				// 	graphData[t][jt] = Math.random() * 10
				// }
  		})
  	}

  	return graphData;
  }
  getChartConfig() {
  	if (!this.chartData.length)
  		return;
  	let chartConfig = {
		  type: "stock",
		  "theme": "dark",
		  "dataSets": [{
		    "fieldMappings": [],
		    "dataProvider": this.chartData,
		    "categoryField": "date"
		  }],
		  "panels": [{
		    "stockGraphs": []
		  }],
		  "chartScrollbarSettings" : {
		    enabled : false
		  },

		  "chartCursorSettings": {
		    "valueBalloonsEnabled": true,
		    "fullWidth": true,
		    "cursorAlpha": 0.1,
		    "valueLineBalloonEnabled": true,
		    "valueLineEnabled": true,
		    "valueLineAlpha": 0.5
		  },
		}
  	let firstData = this.chartData[0]
  	Object.keys(firstData).forEach((it, i) => {
  		if (it !== 'date') {
  			chartConfig.dataSets[0].fieldMappings.push({
  				"fromField": it,
		      "toField": it
  			})
  			chartConfig.panels[0].stockGraphs.push({
  				"id": `g${i+1}`,
		      "title": it,
		      "lineThickness": 2,
		      "valueField": it,
		      "useDataSetColors": false
  			})
  		}
  	})

  	return chartConfig

  }
  generateChart() {
  	if (!this.chartData.length || !this.isComponentInitialized)
  		return;
  	let chartConfig = this.getChartConfig()
  	this.chart = this.AmCharts.makeChart("portfolio-breakdown", chartConfig);
  }
  ngOnInit() {
  	this.isComponentInitialized = true
  	this.generateChart()
  }
  ngOnDestroy() {
    if (this.chart) {
      this.AmCharts.destroyChart(this.chart);
      this.chart = null;
    }
  }
  // ngOnInit() {
  // 	this.chartData = this.generateChartData();

  // 	this.chart = this.AmCharts.makeChart("portfolio-breakdown", {
		//   type: "stock",
		//   "theme": "dark",

		//   "dataSets": [ {
		//     "fieldMappings": [ {
		//       "fromField": "value1",
		//       "toField": "value1"
		//     }, {
		//       "fromField": "value2",
		//       "toField": "value2"
		//     }, {
		//       "fromField": "value3",
		//       "toField": "value3"
		//     }, {
		//       "fromField": "value4",
		//       "toField": "value4"
		//     } ],
		//     "dataProvider": this.chartData,
		//     "categoryField": "date"
		//   } ],

		//   "panels": [ {
		//     "stockGraphs": [ {
		//       "id": "g1",
		//       "title": "Graph #1",
		//       "lineThickness": 2,
		//       "fillAlphas": 0.4,
		//       "valueField": "value1",
		//       "useDataSetColors": false
		//     }, {
		//       "id": "g2",
		//       "title": "Graph #2",
		//       "lineThickness": 2,
		//       "fillAlphas": 0.4,
		//       "valueField": "value2",
		//       "useDataSetColors": false
		//     }, {
		//       "id": "g3",
		//       "title": "Graph #3",
		//       "lineThickness": 2,
		//       "valueField": "value3",
		//       "useDataSetColors": false
		//     }, {
		//       "id": "g4",
		//       "title": "Graph #4",
		//       "lineThickness": 2,
		//       "valueField": "value4",
		//       "useDataSetColors": false
		//     }]
		//   }],

		//   // "chartScrollbarSettings": {
		//   //   "graph": "g1"
		//   // },
		//   "chartScrollbarSettings" : {
		//     enabled : false
		//   },

		//   "chartCursorSettings": {
		//     "valueBalloonsEnabled": true,
		//     "fullWidth": true,
		//     "cursorAlpha": 0.1,
		//     "valueLineBalloonEnabled": true,
		//     "valueLineEnabled": true,
		//     "valueLineAlpha": 0.5
		//   },
		// });
  // }
}
