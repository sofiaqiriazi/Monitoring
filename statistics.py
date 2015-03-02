import os
import logging
import json
import time

from datetime import timedelta, date
from flask import Flask, request, session, g, redirect, url_for, abort, \
        render_template, flash
from models import Slot_Conf, JobEnds, Job, TimeInfo, slotStartEnd, Projects, Results, ProjNames, SlotTimes, ProjectTimes
from LbNightlyTools.Utils import Dashboard

DATABASE = 'nightly-builds'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_envvar('FLASKR_SETTINGS',silent = True)
app.config['COUCHDB_DATABASE']='nightly-builds'
app.config['COUCHDB_SERVER']='http://buildlhcb:5984/'
app.config['COUCHDB_VIEWS']='_design/statistics'


def connect_db():
    server = Dashboard(db_info=("http://buildlhcb:5984/",DATABASE))
    return server.db

def getSec(s):
    l = s.split(':')
    return int(l[0]) * 3600 + int(l[1]) * 60 + int((l[2].split('.'))[0])

@app.before_request
def before_request():
    db = connect_db()

@app.route('statistics/')
def show_entries():
    return render_template('know.html')

@app.route('statistics/slots/', methods=['GET'])
def slotInfo(): 

    slots = []
    today = time.strftime("%Y-%m-%d") 
    slots = Slot_Conf.view(db,'statistics/Slots',key = today)         


    slats = [] 
    for s in slots: 
        slats.append({"slot":s['slot'],"plats":s['platforms']}) 

    slats = json.dumps(slats)        

    return slats

@app.route('statistics/todayStats/',methods=['GET'])
def todayStats():
    slots = []
    #set date
    today = time.strftime("%Y-%m-%d")

    weekbefore = (date.today()-timedelta(6)).strftime('%Y-%m-%d')
    
    jobEnds = db.view('statistics/jobEnds',group_level=3,startkey = [today])
    jobStarts = db.view('statistics/jobStarts',group_level=3,startkey = [today])
    slots = Slot_Conf.view(db,'statistics/Slots',startkey = today)
    times = db.view('statistics/completionTime',group = True, startkey = weekbefore)
    data = []
    jobsEnded = {}
    for s in slots:
        jobsEnded[s['slot']] = 0
    for j in jobEnds:
        jobsEnded[j['key'][1]]=j['value']
        
    
    jobsStarted = {}
    for s in slots:
        jobsStarted[s['slot']] = 0
    for j in jobStarts:
        jobsStarted[j['key'][1]]=j['value']

    unfinished = 0
    unstarted = 0
    unfinished_list = []
    unstarted_list = []
    completed_list = []
    for s in slots:
        if(jobsEnded[s['slot']]!=len(s['platforms'])):
            unfinished+=1
            unfinished_list.append(s['slot'])
        if(jobsStarted[s['slot']]!=len(s['platforms'])):
            unstarted+=1
            unstarted_list.append(s['slot'])
        if(jobsStarted[s['slot']]==len(s['platforms']) and jobsEnded[s['slot']]==len(s['platforms'])):
            completed_list.append(s['slot'])
    
    sum = 0
    for t in times:
        if t['key']==today:
            todaymin = t['value']['min']
            sum = sum - (t['value']['max'] - t['value']['min'])
        sum = sum + (t['value']['max'] - t['value']['min'])

    avgcompletion = sum/6
    data = []
    all_list = unfinished_list+unstarted_list+completed_list
    data.append({"total":len(slots),"all":all_list,"finished":len(slots)-unfinished,"unfinished":unfinished,"unstarted":unstarted,"todaymin":todaymin,"avgcompletion":avgcompletion,"listofunfinished":unfinished_list,"listofunstarted":unstarted_list,"listofcompleted":completed_list})

    data =json.dumps(data)

    return data

@app.route('statistics/makechart/',methods=['GET'])
def makechart():
    #request view from couchdb

    weekbefore = (date.today()-timedelta(6)).strftime('%Y-%m-%d')
    endtimes = db.view('statistics/completionTime',group = True, startkey = weekbefore)

    starttimes = db.view('statistics/startTime',group = True, startkey = weekbefore)

    data ={}


    for t in starttimes:
        data[t['key']]={}
        data[t['key']]['minseconds'] = t['value']['min']
    for t in endtimes:
        data[t['key']]['maxseconds'] = t['value']['max']

    data = json.dumps(data,sort_keys=True)

    return data

@app.route('statistics/slotsTimes/',methods=['GET'])
def slotsTimes():
    today = time.strftime("%Y-%m-%d")

    slotsendtimes  = slotStartEnd.view(db,'statistics/slotsTimes',key = [today,"job-end"])
    slotsstarttimes = slotStartEnd.view(db,'statistics/slotsTimes',key = [today,"job-start"])
    data = {}

    slots = Slot_Conf.view(db,'statistics/Slots',key=today)

    for s in slots:
        data[s['slot']]={}
        for p in s['platforms']:
            data[s['slot']][p]={}
            data[s['slot']][p]['start'] = 0
            data[s['slot']][p]['end'] = 0

    for s in slotsendtimes:
        data[s['slot']][s['platform']]['end'] = s['seconds']
    for s in slotsstarttimes:
        data[s['slot']][s['platform']]['start'] = s['seconds']


    data = json.dumps(data)

    return data

#asfdasdfhasdkhjfadshkjfahkjlfshkjlfdsakljhfdsaflkjsadkjflhdas
@app.route('statistics/slotsResults/<slot_name>/',methods = ['GET'])
def slotsResults(slot_name):

    today = time.strftime("%Y-%m-%d")

    slots = Slot_Conf.view(db,'statistics/Slots',key=today)
    projects = ProjNames.view(db,'statistics/projectsInSlot',key=[today,slot_name])
    results = Results.view(db,'statistics/slotsResults',key=[today,slot_name])

    platforms = []
    for s in slots:
        if s['slot']==slot_name:
            platforms = s['platforms']

    dopedict = {}
    for p in platforms:
        dopedict[p] = {}
        dopedict[p]['tests-result'] = []
        dopedict[p]['build-result'] = []

    for r in results:
        dopedict[r['platform']][r['set']].append(r['project'])

    for n in projects:
        names = n['names']

    for p in platforms:
        dopedict[p]['tests-missing'] = filter(lambda x: x not in dopedict[p]['tests-result'],names)
        dopedict[p]['build-missing'] = filter(lambda x: x not in dopedict[p]['build-result'],names)

    resultsdict = {}
    resultsdict['unstarted']=[]
    resultsdict['unfinished']=[]
    for p in platforms:
        resultsdict['unstarted' ]+=dopedict[p]['build-missing']
        resultsdict['unfinished']+=dopedict[p]['tests-missing']

    finished = list(set(names)-set(resultsdict['unfinished']))
    unstarted = list(set(resultsdict['unstarted']))
    unfinished = list(set(resultsdict['unfinished'])-set(resultsdict['unstarted']))

    data=[]
    data.append({"total":len(results),"slot":slot_name,"platforms":platforms,"dopedict":dopedict,"unstarted":unstarted,"unfinished":unfinished,"finished":finished})

    data = json.dumps(data)

    return data

@app.route('statistics/slotTimeInfo/<slot_name>/',methods = ['GET'])
def slotTimeInfo(slot_name): 

    today = time.strftime("%Y-%m-%d")
    yesterday = (date.today()-timedelta(1)).strftime('%Y-%m-%d')
    preyesterday = (date.today()-timedelta(2)).strftime('%Y-%m-%d')
        
    slotsendtimes  = SlotTimes.view(db,'statistics/slotTimeInfo',key = [today,slot_name,"job-end"]) 
    slotsstarttimes = SlotTimes.view(db,'statistics/slotTimeInfo',key = [today,slot_name,"job-start"]) 
    data = {} 

    slots = Slot_Conf.view(db,'statistics/Slots',key=today) 

    for s in slots: 
        if s['slot'] == slot_name: 
            data[s['slot']]={} 
            for p in s['platforms']: 
                data[s['slot']][p]={} 
                data[s['slot']][p]['start'] = "" 
                data[s['slot']][p]['end'] = "" 
                data[s['slot']][p]['avgcompletion'] = 0 

    for s in slotsendtimes: 
        data[s['slot']][s['platform']]['end'] = s['time']
    for s in slotsstarttimes: 
        data[s['slot']][s['platform']]['start'] = s['time']       

    slotsyesendtimes = SlotTimes.view(db,'statistics/slotTimeInfo',key = [yesterday,slot_name,"job-end"]) 
    for s in slotsyesendtimes: 
        data[s['slot']][s['platform']]['avgcompletion']+=getSec(s['time'])/2 

    slotspreyesendtimes = SlotTimes.view(db,'statistics/slotTimeInfo',key = [preyesterday,slot_name,"job-end"]) 
    for s in slotspreyesendtimes: 
        data[s['slot']][s['platform']]['avgcompletion']+=getSec(s['time'])/2 


    data = json.dumps(data);         
    return data

@app.route('statistics/projectTimes/<slot_name>/<platform_name>')
def projectTimes(slot_name,platform_name):
    today = time.strftime("%Y-%m-%d")


    data = {}
    data["build"] = {}
    data["tests"] = {}
    projects = ProjNames.view(db,'statistics/projectsInSlot',key=[today,slot_name])

    for p in projects:
        data["projects"] = p['names']
        for n in data["projects"]:
            data["build"][n]={}
            data["tests"][n]={}
            data["build"][n]['start_build'] = '00:00:00'
            data["build"][n]['complet_build'] = '00:00:00'
            data["tests"][n]['start_build'] = '00:00:00'
            data["tests"][n]['complet_build'] = '00:00:00'




    build_times = ProjectTimes.view(db,'statistics/projectTimes',key=[slot_name,platform_name,today,"build-result"])
    for t in build_times:
        data["build"][t['project']]['start_build'] = t['started']
        data["build"][t['project']]['complet_build'] = t['completed']

    tests_times = ProjectTimes.view(db,'statistics/projectTimes',key=[slot_name,platform_name,today,"tests-result"])

    for t in tests_times:
        data["tests"][t['project']]['start_build'] = t['started']
        data["tests"][t['project']]['complet_build'] = t['completed']

    data = json.dumps(data)

    return data

if __name__=='__main__':
    db = connect_db()
    app.run()

