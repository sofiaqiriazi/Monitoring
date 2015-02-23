function(doc) {
	if(doc.type=="tests-result" || doc.type=="build-result"){
 		 emit([((doc.started).split("T"))[0],doc.slot], {project:doc.project,doc_type:"Results",set:doc.type,started:doc.started,completed:doc.completed,platform:doc.platform});
	}
}
