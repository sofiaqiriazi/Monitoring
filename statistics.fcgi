#!/usr/bin/python
from flup.server.fcgi import WSGIServer
from statistics import app

if __name__ == '__main__':
    WSGIServer(app).run()
