from datetime import datetime
from couchdb.mapping import Document, TextField, DateTimeField, IntegerField, ListField, ViewField

# Create your models here.

class Projects(Document):
	name = TextField()
	version = TextField()
#	build_id = IntegerField()
#	type = TextField()
#	platform = TextField()
#	stime = DateTimeProperty(default = datetime.utcnow)
#	etime = DateTimeProperty(default = datetime.utcnow)


class Slot_Conf(Document):
	name = TextField()
	build_id = IntegerField()
	projects = ListField(TextField(),default=[])
	platforms = ListField(TextField(),default = [])

class TimeInfo(Document):
	type = TextField(default="TimeInfo")
	max = IntegerField()

class JobEnds(Document):
	platforms = ListField(TextField())
	slot = TextField()
	value = TextField()

class Job(Document):
	platforms = ListField(TextField())
	slot = TextField()
	value = TextField()


class Results(Document):
	project = TextField()
	platform = TextField()
	started = TextField()
	completed = TextField()
	set = TextField()

class ProjNames(Document):
	names = ListField(TextField())

class slotStartEnd(Document):
	platform = TextField()
	time = IntegerField()

class SlotTimes(Document):
	platform = TextField()
	time = TextField()

class ProjectTimes(Document):
	started = TextField()
	completed = TextField()
	project = TextField()

