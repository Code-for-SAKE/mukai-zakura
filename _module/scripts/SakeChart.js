/*!
 * SakeCharts.js v0.0.1
 * https://code-for-sake.github.io/
 * (c) 2020 Code for SAKE
 * Released under the MIT License
 */
function SakeChart(datasets = [], selector="") {
  this.selector = selector;
  this.datasets = datasets;
  this.datas_tm = [];
  this.datas_rc = [];
  this.map_x = {min:0,max:0,ticks:{min:0,max:0}};
  this.map_y = {min:0,max:0,ticks:{min:0,max:0}};
  this.map_r = {min:0,max:0,ticks:{min:0,max:0}};
  this.radar_val = {min:0,max:0,ticks:{min:0,max:0}};
  this.RADIUS_SCALE = 0.2;
  this.COLORSCHEMES = 'brewer.GnBu9';
  this.RADAR_LABELS = ['硬度柔度', '精米歩合', '日本酒度', '酸度', 'アミノ酸度', 'アルコール度数' ];

  this.calcTicks = function(data, scaler) {
    //最大値と最小値を算出
    if(scaler.min > data) scaler.min = data;
    if(scaler.max < data) scaler.max = data;
    if(scaler.min > 0){
      //最小値が0以上なら、0からMAXが入るように
      scaler.ticks.min = 0;
      scaler.ticks.max = Math.ceil(scaler.max)+1;
    }else{
      //最小値が0以下なら、0が真ん中に来るように
      scaler.ticks.min = Math.floor(scaler.min)-1;
      scaler.ticks.max = Math.ceil(scaler.max)+1;
      if(-scaler.ticks.min < scaler.ticks.max) {
        scaler.ticks.min = -scaler.ticks.max;
      }else{
        scaler.ticks.max = -scaler.ticks.min;
      }
    }
  }
  this.setData = function(datasets = this.datasets) {
    let rgba = '';
    for (let list of datasets) {
      // テイスティングマップ用データセット作成
      this.datas_tm.push({
      	label: list[0],
      	data: [{x: list[1], y: list[2], r: list[3]*this.RADIUS_SCALE, value: list[3]}],
      	href: list[4]
      });
      this.calcTicks(list[1],this.map_x);
      this.calcTicks(list[2],this.map_y);
      this.calcTicks(list[3],this.map_r);


   		// レーダーチャート用データセット作成
   		this.datas_rc.push({
   			label: list[0],
   			hitRadius: 2,
   			href: list[4],
   			data: list[5]
   		});


   	}
  };
  this.drawBackground = function(target) {
    var xscale = target.scales["x-axis-0"];
    var yscale = target.scales["y-axis-0"];
    var left = xscale.getPixelForValue(xscale.min);
    var top = yscale.getPixelForValue(yscale.max);
		var bottom = yscale.getPixelForValue(yscale.min);
		var right = xscale.getPixelForValue(xscale.max);

		var height = bottom-top;
		var width = right-left;

		var fontSize = 15;
		target.ctx.font = "bold "+ fontSize +"px Arial, meiryo, sans-serif" ;
		target.ctx.strokeStyle = "rgba(128, 128, 128, 1)";
		target.ctx.lineWidth = 2;

		//種類の描画
		var drawType = function(ctx,x,y,r,name,fillStyle = "rgba(64, 64, 64, 0.2)"){
			let orgFillStyle = ctx.fillStyle;
      ctx.beginPath();
      ctx.fillStyle = fillStyle;
      ctx.arc(x,y,r, 0, Math.PI * 2, true);
      ctx.fill();
			ctx.fillStyle = orgFillStyle;
			textWidth = ctx.measureText( name ).width;
			ctx.fillText( name, x-(textWidth/2), y) ;
    };
		drawType(target.ctx,xscale.getPixelForValue(2.5),yscale.getPixelForValue(2.5),50,'熟酒', "rgba(255, 0, 0, 0.2)");
		drawType(target.ctx,xscale.getPixelForValue(-2.5),yscale.getPixelForValue(2.5),50,'薫酒', "rgba(0, 255, 0, 0.2)");
		drawType(target.ctx,xscale.getPixelForValue(2.5),yscale.getPixelForValue(-2.5),50,'酵酒', "rgba(0, 0, 255, 0.2)");
		drawType(target.ctx,xscale.getPixelForValue(-2.5),yscale.getPixelForValue(-2.5),50,'爽酒', "rgba(255, 255, 0, 0.2)");

		//軸の描画
		var drawAxes = function(ctx,x,y,w,h,xp,xn,yp,yn,margin=5) {
			let fontSize = ctx.measureText( yp ).actualBoundingBoxAscent+ctx.measureText( yp ).actualBoundingBoxDescent;
			let lx = x+ctx.measureText( xn ).width+margin;
			let lx2 = x+w-ctx.measureText( xp ).width-margin;
			let ly = y+fontSize+margin;
			let ly2 = y+h-fontSize-margin;
			ctx.beginPath();
			ctx.moveTo( lx, y+h/2);
			ctx.lineTo( lx2, y+h/2);
			ctx.moveTo( x+w/2, ly);
			ctx.lineTo( x+w/2, ly2);
			ctx.stroke();
			ctx.fillText( yp, x+w/2-ctx.measureText( yp ).width/2, y+fontSize/2) ;
			ctx.fillText( yn, x+w/2-ctx.measureText( yn ).width/2, y+h-fontSize/2) ;
			ctx.fillText( xp, x+w-ctx.measureText( xp ).width, y+h/2) ;
			ctx.fillText( xn, x, y+h/2) ;
		};
		var width = right-left;
		var height = bottom-top;
		drawAxes(target.ctx,left,top,width,height,'味が濃い','味が淡い','香が豊か','香が静か');
  };
  this.calcLabel = function(tooltipItems, data) {
  	var item = data.datasets[tooltipItems.datasetIndex];
  	return item.label + "：精米歩合" + (item.data[0].value);
  };
  this.drawMap = function(selector = this.selector){
    let ctx = document.getElementById(selector).getContext('2d');
   	new Chart(ctx,
   		{
   			plugins: [{
   				beforeDatasetsDraw: this.drawBackground
   			}],
   			type: 'bubble',
   			data: {
   				datasets: this.datas_tm
   			},
   			options: {
   				plugins: 	{
   					colorschemes: {
   						scheme: this.COLORSCHEMES
   					}
   				},
   				tooltips:{
            mode: 'nearest',
            callbacks:
            {
              label: this.calcLabel
            }
   				},
   				legend: {
   					display: true,
   					position: 'top',
   					labels: {
   						fontSize: 10,
   					}
   				},
   				scales: {
   					yAxes: [{
   						display: false,
   						scaleLabel: {
   							display: false,
   						},
   						ticks: {
   							suggestedMin: this.map_y.ticks.min,
   							suggestedMax: this.map_y.ticks.max
   						}
   					}],
   					xAxes: [{
   						display: false,
   						scaleLabel: {
   							display: false,
   						},
   						ticks: {
   							suggestedMin: this.map_x.ticks.min,
   							suggestedMax: this.map_x.ticks.max
   						}
   					}]
          },
   	      onHover: function(e, el) {
            //ポインタ表示
            if (el.length) e.target.style.cursor = 'pointer';
            else e.target.style.cursor = 'default';
          },
   				onClick: function (e, el) {
            //対象のURLに遷移
            if (! el || el.length === 0) return;
            data = el[0]._chart.data.datasets[el[0]._datasetIndex];
            location.href= data.href;
   	      }
   			}
   		});
    };
   this.drawRadar = function(selector = this.selector) {
     let ctx = document.getElementById(selector).getContext('2d');
     new Chart(ctx, {
       type: 'radar',
       data: {
         labels: this.RADAR_LABELS,
         datasets: this.datas_rc,
       },
       options: {
         plugins: 	{
           colorschemes: {
             scheme: this.COLORSCHEMES
           }
         },
         scale: {
           ticks: {
             showLabelBackdrop: false,
             max: 10,
             min: 0,
             stepSize: 2
           }
         },
         legend: {
          display: true,
          position: 'top',
          labels: {
            fontSize: 10,
          },
          onHover: function(e) {
            e.target.style.cursor = 'pointer';
          }
        },
         onHover: function(e, el) {
           //ポインタ表示
           if (el.length) e.target.style.cursor = 'pointer';
           else e.target.style.cursor = 'default';
         },
         onClick: function (e, el) {
           //対象のURLに遷移
           if (! el || el.length === 0) return;
           data = el[0]._chart.data.datasets[el[0]._datasetIndex];
           location.href= data.href;
         },
       }
     });
   };

   //生成時実行
   this.constructor = function() {
     this.setData();
   };
   this.constructor();
 }
