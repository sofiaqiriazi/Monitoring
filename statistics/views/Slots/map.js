function(doc) {
  if(doc.type == "slot-config"){
	var values = {};
	values.slot = doc.slot;
	values.platforms = doc.default_platforms;
	values.doc_type = "Slot_Conf";
	emit(doc.date,values);	
  }
}
