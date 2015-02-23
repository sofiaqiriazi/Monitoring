function(doc){
	if(doc.type=="build-result" || doc.type=="tests-result"){
		emit([doc.slot,doc.platform,doc.started.split("T")[0],doc.type],{started:doc.started.split("T")[1],completed:doc.completed.split("T")[1],project:doc.project,doc_type:"ProjectTimes"});
	}
}
