function(doc){
	if(doc.type == "job-start"){
		times = (doc.started).split("T");
     		total = times[1].split(":");
     		seconds = parseInt(total[0])*3600+parseInt(total[1])*60+parseFloat(total[2]);
     		emit(times[0],seconds);
	}
}
