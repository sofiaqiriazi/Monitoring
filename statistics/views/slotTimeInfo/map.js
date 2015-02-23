function(doc){
        if(doc.type == "job-end"){
               times = ((doc.completed).split("T"))[1];
               emit([((doc.completed).split("T"))[0],doc.slot,doc.type],{'time': times ,'platform': doc.platform,'slot':doc.slot,'doc_type':"SlotTimes" });
        }

        if(doc.type == "job-start"){
                times = ((doc.started).split("T"))[1];
                emit([((doc.started).split("T"))[0],doc.slot,doc.type],{'time': times , 'platform': doc.platform,'slot':doc.slot,'doc_type':"SlotTimes" });
        }
}

