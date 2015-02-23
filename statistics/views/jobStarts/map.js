function(doc) {
	var parameters=[];
	if(doc.type == "job-start"){
		parameters.push(((doc.started).split("T"))[0]);
		parameters.push(doc.slot);
		emit(parameters,doc.platform);
	}
}
