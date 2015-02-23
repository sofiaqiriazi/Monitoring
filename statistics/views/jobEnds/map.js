function(doc) {
	var parameters=[];
	if(doc.type == "job-end"){
		parameters.push(((doc.completed).split("T"))[0]);
		parameters.push(doc.slot);
		emit(parameters,doc.platform);
	}
}
