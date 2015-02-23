var $frame = $('#frame');
var $wrap = $frame.parent();


function FloattoTime(data) {
	var sec_num = parseInt(data, 10); // don't forget the second param
	var hours   = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	var time    = hours+':'+minutes+':'+seconds;
	return time;
}

function createComparisonFlow(slot){

	$('#'+slot+'-subframe').sly('destroy');
	$('#'+slot+'-subframe').sly({
		horizontal: 1,
		itemNav: 'basic',
		smart:1,
		activateOn:'click',
		mouseDragging: 1,
		touchDragging: 1,
		scrollBy: 1,
		prev: 'li',
		next: 'li',
		dragging: 1,
		speed: 300,
		keyboardNavBy: "items",
	});

	$('#'+slot+'-subframe').sly('reload');
}

function loadProjectsProgress(id){
	
	var slot = id.split('?')[0];
	var platform = id.split('?')[1];	
	$('.slotfocus').append('<div id='+id+'linechart'+' class="columnchart"></div>');
	$.get('projectTimes/'+slot+'/'+platform,function(data){
		
		data = jQuery.parseJSON(data);
		var build_times = data.build;
		var tests_times = data.tests;
		var projects = data.projects;
		
		builds = [];
		for (var p in projects){
			projects[p];
			var completed;
			var started;
			started = build_times[projects[p]].start_build;
			completed = build_times[projects[p]].complet_build;
			
			var temp = [projects[p], 'build', new Date(2014,3,26,started.split(':')[0],started.split(":")[1],started.split(":")[2])
							, new Date(2014,3,26,completed.split(':')[0],completed.split(":")[1],completed.split(":")[2])];
			builds.push(temp);
			
			started = tests_times[projects[p]].start_build;
			completed = tests_times[projects[p]].complet_build;
		
			var temp = [projects[p], 'tests', new Date(2014,3,26,started.split(":")[0],started.split(":")[1],started.split(":")[2])
							, new Date(2014,3,26,completed.split(":")[0],completed.split(":")[1],completed.split(":")[2])];
			builds.push(temp);

		}


		var tests_ar = [];
		for (var p in projects){
			build_com = build_times[projects[p]].complet_build;
			tests_com = build_times[projects[p]].complet_build;
			tests_ar.push([projects[p],
				[parseInt((build_com.split(":"))[0]),parseInt((build_com.split(":"))[1]),parseInt((build_com.split(":"))[2])],
				[parseInt((tests_com.split(":"))[0]),parseInt((tests_com.split(":"))[1]),parseInt((tests_com.split(":"))[2])]]);
		}

		google.load("visualization", "1", {packages:["corechart"],callback: drawChart2});


	function drawChart() {

            var data = new google.visualization.DataTable();
                        data.addColumn('string','Projects');
                        data.addColumn('timeofday','build');
                        data.addColumn('timeofday','tests');
                        data.addRows(tests_ar);

			
		  var options = {
		    width: 400,
	    	    title: 'Total',
		    hAxis: {title: 'Projects', titleTextStyle: {color: 'red'}}
		  };

		  var chart = new google.visualization.ColumnChart(document.getElementById(slot+'?'+platform+'?'+'timeinfoslinechart'));

		  chart.draw(data, options);
	}
	
	function drawChart2(){
		var container = document.getElementById(slot+'?'+platform+'?'+'timeinfoslinechart');
		var chart = new google.visualization.Timeline(container);
	
		var dataTable = new google.visualization.DataTable();
	  	dataTable.addColumn({ type: 'string', id: 'Project' });
		dataTable.addColumn({ type: 'string', id: 'type' });
		dataTable.addColumn({ type: 'date', id: 'Start' });
		dataTable.addColumn({ type: 'date', id: 'End' });
		dataTable.addRows(builds);
	
		var options={
			width:400,	
		};
	
		chart.draw(dataTable,options);
	}

	});
	
}


function appendTimeInfoTable(slot){

			domain = $('#'+slot+'-focuschart');	
			$('.slotfocus').append('<div id='+ slot + "-subframe" +' class="subframe"><ul class="comparison">'+
					'</ul></div>');

		

			var now = new Date();
			$.get('slotTimeInfo/'+slot,function(data){
				
				$(".comparison").empty();
				data = jQuery.parseJSON(data);
				for (var platform in data[slot]){
					var starttime = data[slot][platform]['start'];
					var endtime = data[slot][platform]['end'];
					var avgcompletion = data[slot][platform]['avgcompletion'];

					//create table
					//crate li for ul
					var listel = $('<li></li>');
					var table = $('<table id='+slot +"?"+ platform+"?timeinfos"+' ></table>');
					//create rows in table
					//add table to the ul
					//get next platform
					var row;
			row = $('<tr></tr>').addClass('bar').text(platform);
			table.append(row);
			row = $('<tr></tr>').addClass('bar').text('Start Time: '+ starttime.split('.')[0]); 
			row.append('<td><img src="https://cdn4.iconfinder.com/data/icons/Once_by_Delacro/Clock.png"  style="width:40%;" /></td>');
			table.append(row); 
			row = $('<tr></tr>').addClass('bar').text('End Time: '+ endtime.split('.')[0]); 
			row.append('<td><img src="https://cdn4.iconfinder.com/data/icons/Once_by_Delacro/Clock.png"  style="width:40%;" /></td>');
			table.append(row);
			row = $('<tr><td><div id ='+slot+platform +"progressbar"+' style="height:15px; width:100px;"></div></td></tr>');		
			table.append(row);

			var secsnow = now.getHours()*3600 + now.getMinutes()*60+now.getSeconds();
			var timerunning = secsnow-((starttime.split(':'))[0]*3600+starttime.split(':')[1]*60+(starttime.split(':')[2])[0]);
			var progress;
			
			if(endtime){
				var timetofinish = ((endtime.split(':'))[0]*3600+(endtime.split(':'))[1]*60+(endtime.split(':'))[2]);
			}	
			else {
 				timetofinish = avgcompletion;
			}
			
			//data[slot][platform]['avgcompletion']
			domain.append(table);
			listel.append(table);
			$(".comparison").append(listel);
			var skata = ((starttime.split(':'))[0]*3600+starttime.split(':')[1]*60+(starttime.split(':')[2])[0]);
			var progress = timerunning*100/timetofinish;

			if(progress > 100 ){
				($("#"+slot+platform+"progressbar").find(".ui-progressbar-value")).css({
						"background": '#FF0000'
						});
			}

			($("#"+slot+platform+"progressbar")).progressbar({
				value:progress,
			});

			($("#"+slot+platform+"progressbar").find(".ui-progressbar-value")).css({
				"background": '#0000FF'
			});

			}
			
				
			}).done(function(){
				createComparisonFlow(slot);

				$('.comparison li').click(function(){
					var slot = ($(this).children()[0].id).split('?')[0];
					var platform = ($(this).children()[0].id).split('?')[1];
					$('.columnchart').remove();
					loadProjectsProgress(($(this).children()[0]).id);
				});

			});
}

function messWithCoverflow(){
	var $frame = $('#frame');
	var $wrap = $frame.parent();
	// // To Start button
	// Call Sly on frame
	var $slidee = $frame.children('ul').eq(0);
	$frame.sly('destroy');
	$frame.sly({
		horizontal: 1,
		itemNav: 'forceCentered',
		smart: 1,
		activateOn: 'click',
		mouseDragging: 1,
		touchDragging: 1,
		releaseSwing: 1,
		startAt: 0,
		scrollBar: $wrap.find('.scrollbar'),
		scrollBy: 1,
		speed: 300,
		elasticBounds: 1,
		easing: 'easeOutExpo',
		dragHandle: 1,
		dynamicHandle: 1,
		clickBar: 1,
		// // Buttons
		prev: $(document).find('.prev'),
		next: $(document).find('.next'),
	});

	$wrap.show();
	$frame.sly('reload');

	$(document).find('.prev').on('click',function () {
		var sha = ($wrap.find('.active').children().children()[0].id);
		$('#'+sha).click();
	});

	$(document).find('.next').on('click',function () {
		var sha = ($wrap.find('.active').children().children()[0].id);
		$('#'+sha).click();
	});	

	return;	
		
}


function makeTodaySlotTimesChart(){

	$.get('slotsTimes/',{},function(data){
		data = jQuery.parseJSON(data);
			for(var i in data){
			}
	});

}

function makeSlotPieChart(slot){

	var domain = $('#frame ul');
	domain.append('<li><div class="packet"><div id='+ slot + '></div><div id=' + slot + "-frame" +'></div></div></li>');

	$.get('slotsResults/'+slot,function(data){
			data = jQuery.parseJSON(data);
			var finished = data[0].finished;
			var unfinished = data[0].unfinished;
			var unstarted = data[0].unstarted;
			var stats = new google.visualization.DataTable();
			stats.addColumn('string', 'Topping');
			stats.addColumn('number', 'Slices');
			stats.addRows([
				['Finished', finished.length],
				['Unfinished', unfinished.length],
				['Unstarted', unstarted.length],
				]);

			var options = {};
			options['title'] = data[0].slot ;
			options['width'] = 300;
			options['height'] = 300;
			options['tooltip'] = { trigger: 'selection' };

			options['enableInteractivity'] = false;
			var chartdiv = $('#'+data[0].slot)

			var chart = new google.visualization.PieChart(document.getElementById(data[0].slot));
			chart.draw(stats, options);
			
			

			$('#'+slot).click(function(){
					if ($('.slotfocus').is(':empty')){
  					//do something
					$('#todayBoard').animate({
							width: "30%",
							float: "left",	
							}, {duration:1500,queue:false});
					$('#todayinfos').animate({
							margin:"280px auto auto",
							}, {duration:1500,queue:false});	
					$('#weekchart').animate({
							width: "35%",
							float: "left",	
							}, {duration:1500,queue:false});
					$('.slotfocus').animate({
							width: "32.5%",
							float:"left",	
							}, {duration:1500,queue:false});
										
  					}
					$('.slotfocus').empty();
					$newslotchart =  '<div id='+slot+"-focuschart"+' class="focuschart"></div>';
					$('.slotfocus').append($newslotchart);

					var chart = new google.visualization.PieChart(document.getElementById(slot+"-focuschart"));
					options['enableInteractivity'] = true;
					options['width'] = 150;
					options['height'] = 200;
					options['slices'] = { 	0: {offset: 0.2},
								1: {offset: 0.1},
								2: {offset: 0.2},
					};

                                chart.setAction({
                                id: 'sample',                  // An id is mandatory for all actions.
                                text: 'LOAD PROJECTS',       // The text displayed in the tooltip.
                                action: function() {           // When clicked, the following runs.
                                selection = chart.getSelection();

                        	switch (selection[0].row) {
                                	case 0:
                                        	break;
                                	case 1:
                                        	break;
                                	case 2:
                                        	break;
                                	}

                                }
                        });
		
			chart.draw(stats, options);
			//$('.slotfocus').append($('#'+slot+"-subframe"));
			appendTimeInfoTable(slot);
			
			});
		
	});
		


}

function displayMoreInfo(data){

	for (var i in data){
		google.load("visualization", "1.0", {packages:["corechart"]});
		makeSlotPieChart(data[i]);	
	}
	
}

function makeWeekLineChart(){

	$.get('makechart/',{},function(data){
			var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			data = jQuery.parseJSON(data);
					
			var dataarray = []
			for (var d in data){
				
				var year = parseInt(d.split("-")[0]);
				var month = parseInt(d.split("-")[1]);
				var day = parseInt(d.split("-")[2]);
				var minhours   = Math.floor(data[d].minseconds / 3600);
				var minminutes = Math.floor((data[d].minseconds - (minhours * 3600)) / 60);
				var minseconds = data[d].minseconds - (minhours * 3600) - (minminutes * 60);
				var maxhours   = Math.floor(data[d].maxseconds / 3600);
				var maxminutes = Math.floor((data[d].maxseconds - (maxhours * 3600)) / 60);
				var maxseconds = data[d].maxseconds - (maxhours * 3600) - (maxminutes * 60);

				mera = new Date(year,month-1,day);
			
				var temp = [ days[mera.getDay()], "Completed..." , new Date(0,0,0,minhours,minminutes,minseconds),
									   new Date(0,0,0,maxhours,maxminutes,maxseconds)];
				dataarray.push(temp);
			}
			
			dataarray[6] = [ days[mera.getDay()], "Running..." , new Date(0,0,0,minhours,minminutes,minseconds),
									   new Date(0,0,0,maxhours,maxminutes,maxseconds)];

			var chart = new google.visualization.Timeline(document.getElementById('weekchart'));
			var data = new google.visualization.DataTable();

			data.addColumn({type:'string',id:'Day'});
			data.addColumn({type:'string',id:'time spent'})
			data.addColumn({type:'date',id: 'starttime'});
			data.addColumn({type:'date',id: 'endtime'});
			
			data.addRows(dataarray);

			var options = {
				title: 'Week Statistics',
			       	pointSize: 5,
			       	width: 600,
			       	height: 400,
			       // This line makes the entire category's tooltip active.
			       // Use an HTML tooltip.
			};

			chart.draw(data, options);


	});

}

function makestaff(){	
	$.get('todayStats/',{},function(data){

			data = jQuery.parseJSON(data);	
			var stats = new google.visualization.DataTable();
			stats.addColumn('string', 'Topping');
			stats.addColumn('number', 'Slices');
			stats.addRows([
				['Finished', data[0].finished],
				['Unfinished', data[0].unfinished],
				['Unstarted', data[0].unstarted],
				]);

			var options = {};
			options['title'] = 'TOTAL OF SLOTS : '+ data[0].total;
			options['width'] = 400;
			options['height'] = 400;
			options['tooltip'] = { trigger: 'selection' };
			options['slices'] = { 0: {offset: 0.2},
			1: {offset: 0.1},
			2: {offset: 0.1},
			};

			var now = new Date();

			domain = $('#todayinfos');	
			var table = $('<table id=timeinfos></table>');
			var row;

			row = $('<tr></tr>').addClass('bar').text('Current Time:'+ ((now.toTimeString()).split(" "))[0]);
			row.append('<td><img src="https://cdn4.iconfinder.com/data/icons/Once_by_Delacro/Clock.png"  style="width:40%;" /></td>');
			table.append(row);
			row = $('<tr></tr>').addClass('bar').text('Starting Time:'+ FloattoTime(data[0].todaymin)); 
			row.append('<td><img src="https://cdn4.iconfinder.com/data/icons/Once_by_Delacro/Clock.png"  style="width:40%;" /></td>');
			table.append(row); 
			row = $('<tr></tr>').addClass('bar').text('Ending Time:'+ FloattoTime(data[0].avgcompletion)); 
			row.append('<td><img src="https://cdn4.iconfinder.com/data/icons/Once_by_Delacro/Clock.png"  style="width:40%;" /></td>');
			table.append(row);
			//row = $('<tr><td><div id ="progressbar" style="height:15px; width:200px;"></div></td></tr>');	
			//table.append(row);

			var secsnow = now.getHours()*3600 + now.getMinutes()*60+now.getSeconds();
			var timerunning = secsnow-data[0].todaymin;
			var timetofinish = data[0].avgcompletion;

			var progress = timerunning*100/timetofinish;

			if(data[0].finished == data[0].total){
				progress = 100;
			}

			if(progress > 100 ){
				($("#progressbar").find(".ui-progressbar-value")).css({
						"background": '#FF0000'
						});
			}

			$( "#progressbar" ).progressbar({
				value: progress,
			});

			($("#progressbar").find(".ui-progressbar-value")).css({
				"background": '#3366CC'
			});

			domain.prepend(table);

			displayMoreInfo(data[0].all);
			messWithCoverflow();
	var sha = $('.wrap').find('.active').children().children()[0].id;
	
	$('#'+sha).click();

			var chart = new google.visualization.PieChart(document.getElementById('piechart'));
			chart.setAction({
				id: 'sample',                  // An id is mandatory for all actions.
				text: 'LOAD SLOTS',       // The text displayed in the tooltip.
				action: function() {           // When clicked, the following runs.
				selection = chart.getSelection();

			switch (selection[0].row) {
				case 0:	$('#frame ul').empty();
					displayMoreInfo(data[0].listofcompleted);
					messWithCoverflow();
					break;
				case 1: $('#frame ul').empty();
					displayMoreInfo(data[0].listofunfinished);
					messWithCoverflow();
					break;
				case 2: $('#frame ul').empty();
					displayMoreInfo(data[0].listofunstarted);
					messWithCoverflow();
					break;
				}
				
				}
			});

			chart.draw(stats, options);
			$(function () {
    				var $element = $('#progressbar');
				setInterval(function () {
				        $element.fadeIn(500, function () {
					            $element.fadeOut(500, function () {
					                $element.fadeIn(500)
					            });
				        });
			    }, 500);
			});
		});
}

$(document).ready(function(){
		//	makeWeekLineChart();
		//	makeDayPieChart();
		//	hide the slideshow
		$('.wrap').hide();
		//	make todays Pie Chart and slideshow of slots 
		google.load("visualization", "1.0", {packages:["corechart"], callback: makestaff});
		//	make all week's Line Chart
		google.load("visualization", "1.0", {packages:["corechart"], callback: makeWeekLineChart});
		//	show all the slots building
		google.load("visualization", "1.0", {packages:["corechart"], callback: makeTodaySlotTimesChart});

		});


$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
	$('.prev').click();
        break;


        case 39: // right
	$('.next').click();
        break;
	
	case 13: //enter
	var sha = $('.wrap').find('.active').children().children()[0].id;
	
	$('#'+sha).click();
	break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(window).resize(function(e) {	
	$('#frame').sly('reload');
});


