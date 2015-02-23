function(doc){
	if(doc.type == "slot-config"){
		projects = [];
		doc.projects.forEach(function(project) {
			projects.push(project.name);
		});
		emit([doc.date,doc.slot],{names:projects,doc_type:"ProjNames"});
	}
}
