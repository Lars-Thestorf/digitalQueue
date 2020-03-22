#! /usr/bin/env python3
import base64
import configparser
import hashlib
import http.server
import json
import os
import socketserver
import sqlobject
import urllib.parse

# Connect to database management system
config = configparser.ConfigParser()
config.read('config.ini')
sqlobject.sqlhub.processConnection = sqlobject.connectionForURI("mysql://{}:{}@{}:{}/{}".format(config['DEFAULT']['user'],
    config['DEFAULT']['password'], config['DEFAULT']['host'], config['DEFAULT']['port'], config['DEFAULT']['database']))

class Queue(sqlobject.SQLObject):
    queueId = sqlobject.StringCol(length=43, alternateID=True, unique=True, notNone=True)
    name = sqlobject.StringCol(length=255, unique=True, notNone=True)
    password = sqlobject.StringCol(length=128, notNone=True)
    salt = sqlobject.StringCol(length=43, alternateID=True, unique=True, notNone=True)
    currentPosition = sqlobject.IntCol(length=32, notNone=True, defaultSQL=0)
    
class Customer(sqlobject.SQLObject):
    customerId = sqlobject.StringCol(length=43, alternateID=True, unique=True, notNone=True)
    position = sqlobject.IntCol(length=32, notNone=True)
    count = sqlobject.IntCol(length=32, notNone=True, defaultSQL=1)
    queueId = sqlobject.ForeignKey("Queue", cascade=True, notNone=True)
    
class Admin(sqlobject.SQLObject):
    adminId = sqlobject.StringCol(length=43, alternateID=True, unique=True, notNone=True)
    queueId = sqlobject.ForeignKey("Queue", cascade=True, notNone=True)

def create_database():
    Queue.createTable(ifNotExists=True)
    Customer.createTable(ifNotExists=True)
    Admin.createTable(ifNotExists=True)

class OperationException(Exception):
    def __init__(self, message):
        super(OperationException, self).__init__(message)

class AuthentificationException(Exception):
    def __init__(self, message):
        super(AuthentificationException, self).__init__(message)

class RestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        path = self.path[1:]
        parameters = json.loads(self.rfile.read(int(self.headers['Content-Length'])).decode('utf-8'))
        try:
            response = {}
            if "create_queue" == path:
                queueId = base64.urlsafe_b64encode(os.urandom(32)).decode("ASCII").replace("=", "")
                sessionID = base64.urlsafe_b64encode(os.urandom(32)).decode("ASCII").replace("=", "")
                salt = base64.urlsafe_b64encode(os.urandom(32)).decode("ASCII").replace("=", "")
                name = parameters["name"]
                password = hashlib.sha3_512((parameters["password"] + salt).encode('utf-8')).hexdigest()
                queue = Queue(queueId = queueId, name = name, password = password, salt = salt, currentPosition = 0)
                admin = Admin(adminId = sessionID, queueId = queue)
                response["queueID"] = queue.queueId
                response["sessionID"] = admin.adminId
            elif "login" == path:
                name = parameters["name"]
                queue = Queue.selectBy(name = name)[0]
                password = hashlib.sha3_512((parameters["password"] + queue.salt).encode('utf-8')).hexdigest()
                if(queue.password != password):
                    raise AuthentificationException("Invalid user or password")
                admin = Admin.selectBy(queueId = queue)[0]
                response["queueID"] = admin.queueId.queueId
                response["sessionID"] = admin.adminId
            elif "admit" == path:
                queueId = parameters["queueID"]
                sessionId = parameters["sessionID"]
                count = int(parameters["count"])
                queue = Admin.selectBy(adminId = sessionId)[0].queueId
                select = sqlobject.sqlbuilder.Select(["position", "count"], staticTables=["customer"],
                    where = "queue_id_id = {} AND position > {}".format(queue.id, queue.currentPosition))
                customers = sqlobject.sqlhub.processConnection.queryAll(sqlobject.sqlhub.processConnection.sqlrepr(select))
                entranceCount = 0
                newPosition = queue.currentPosition
                for position in customers:
                    if count >= entranceCount + position[1]:
                        entranceCount += position[1]
                        newPosition = position[0]
                    else:
                        break
                queue.currentPosition = newPosition
                response["entranceCount"] = entranceCount
            elif "close" == path:
                sessionId = parameters["sessionID"]
                admin = list(Admin.selectBy(adminId = sessionId))[0]
                delete = sqlobject.sqlbuilder.Delete("queue", where = "id={}".format(admin.queueId.id))
                sqlobject.sqlhub.processConnection.query(sqlobject.sqlhub.processConnection.sqlrepr(delete))
            elif "enter_queue" == path:
                sessionId = base64.urlsafe_b64encode(os.urandom(32)).decode("ASCII").replace("=", "")
                queueId = parameters["queueID"]
                queue = list(Queue.selectBy(queueId = queueId))[0]
                select = sqlobject.sqlbuilder.Select(['MAX(position)'], staticTables=['customer'], where = "queue_id_id = {}".format(queue.id),
                    limit = 1)
                positions = sqlobject.sqlhub.processConnection.queryAll(sqlobject.sqlhub.processConnection.sqlrepr(select))
                if positions[0][0] is not None:
                    position = positions[0][0] + 1
                else:
                    position = 1
                customer = Customer(customerId = sessionId, position = position, queueId = queue)
                response["position"] = customer.position
                response["sessionID"] = customer.customerId
            elif "modify_persons" == path:
                sessionId = parameters["sessionID"]
                count = parameters["count"]
                customer = list(Customer.selectBy(customerId = sessionId))[0]
                customer.count = count
            elif "leave_queue" == path:
                sessionId = parameters["sessionID"]
                delete = sqlobject.sqlbuilder.Delete("customer", where = "customer_id = '{}'".format(sessionId))
                sqlobject.sqlhub.processConnection.query(sqlobject.sqlhub.processConnection.sqlrepr(delete))
            elif "queue_position" == path:
                queueId = parameters["queueID"]
                queue = Queue.selectBy(queueId = queueId)[0]
                response["position"] = queue.currentPosition
            else:
                raise OperationException("Unknown operation")
            self.send_response(200)
            self.send_header("Content-type","application/json")
            self.end_headers()
            response["status"] = "OK"
            self.wfile.write(json.dumps(response).encode("utf-8"))
        except ValueError as exception:
            self.send_response(400)
            self.send_header("Content-type","application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status":"Invalid parameters: {}".format(str(exception))}).encode("utf-8"))
        except OperationException as exception:
            self.send_response(400)
            self.send_header("Content-type","application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status":"Invalid operation: {}".format(str(exception))}).encode("utf-8"))
        except Exception as exception:
            self.send_response(400)
            self.send_header("Content-type","application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status":"Unknown Error: {}".format(str(exception))}).encode("utf-8"))

if "__main__" == __name__:
    create_database()
    with socketserver.ThreadingTCPServer(("", 8080), RestHandler) as server:
        server.serve_forever()
