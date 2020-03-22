# API-Dokumentation
Die Anwendung verwendet ein REST-API mit JSON Encoding.
## Warteschlange erstellen
    POST /create_queue
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| name | Der Anzeigename der Warteschlange als String |
| password | Ein Passwort für das Admin-Interface |
### Response
| Parameter | Beschreibung |
| --- | --- |
queueID | Die ID der neu-erstellten Warteschlange
| sessionID | Die SessionId für das Admin Interface |
| status | OK im Erfolgsfall, sonst Fehlermeldung|

## Admin Login
    POST /login
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| name | Der Anzeigename der Warteschlange als String |
| password | Ein Passwort für das Admin-Interface |
### Response
| Parameter | Beschreibung |
| --- | --- |
queueID | Die ID der neu-erstellten Warteschlange
| SessionID | Die SessionId für das Admin Interface |
| status | OK im Erfolgsfall, sonst Fehlermeldung|

## Weitere Kunden einlassen
    POST /admit
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| queueID | Die ID der zu verwendenen Queue |
| count | Die Anzahl der einzulassenden Personen |
| sessionID | Die SessionId für das Admin Interface |
### Response
| Parameter | Beschreibung |
| --- | --- |
| entranceCount | Die Anzahl der reingelassenen Personen |
| status | OK im Erfolgsfall, sonst Fehlermeldung|

## Warteschlange schließen
    POST /close
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| queueID | Die ID der zu schließenden Queue |
| sessionID | Die SessionId für das Admin Interface |
### Response
| Parameter | Beschreibung |
| --- | --- |
| status | OK im Erfolgsfall, sonst Fehlermeldung|

## Warteschlange betreten
    POST /enter_queue
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| queueID | Die Id der zu betretenden Warteschlange |
### Response
| Parameter | Beschreibung |
| --- | --- |
| position | Die Position in der Warteschlange |
| sessionID | Die SessionId des Wartenden |
| status | OK im Erfolgsfall, sonst Fehlermeldung|

## Personenzahl ändern
    POST /modify_persons
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| queueID | Die ID der Warteschlange |
| count | Die Anzahl der wartenden Personen (max. 3)|
| sessionID | Die SessionId des Wartenden |
### Response
| Parameter | Beschreibung |
| --- | --- |
| status | OK im Erfolgsfall, sonst Fehlermeldung|

## Warteschlange verlassen
    POST /leave_queue
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| queueID | Die ID der zu verlassenden Warteschlange |
| sessionID | Die SessionId des Wartenden |
### Response
| Parameter | Beschreibung |
| --- | --- |
| status | OK im Erfolgsfall, sonst Fehlermeldung|

# Aktuelle Warteschlangenposition abrufen
    POST /queue_position
### Parameter
| Parameter | Beschreibung |
| --- | --- |
| queueID | Die ID der Warteschlange |
### Response
| Parameter | Beschreibung |
| --- | --- |
| position | Die aktuelle Warteschlangen-Position |
| status | OK im Erfolgsfall, sonst Fehlermeldung|
