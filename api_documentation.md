# myproducer.io API Documentation - Pending

* [Get all users](#get-all-users)
* [Get single user](#get-single-user)
* [Update single user](#get-single-user)
* [Delete single user](#delete-single-user)

<span id="get-all-users"></span>
### Get all users
[[Back to top](#)]

##### Request path
```
GET /api/users
```
##### Response

```
[
  {
    "_id": "584b060d27ce132fd59f4905",
    "updatedAt": "2016-12-09T19:29:17.587Z",
    "createdAt": "2016-12-09T19:29:17.587Z",
    "username": "kevin@mean.com",
    "__v": 0,
    "productions": [],
    "skills": [],
    "equipment": [],
    "role": []
  },
  {
    "_id": "584b060d27ce132fd59f4906",
    "updatedAt": "2016-12-09T19:29:18.587Z",
    "createdAt": "2016-12-09T19:29:18.587Z",
    "username": "alex@mean.com",
    "__v": 0,
    "productions": [],
    "skills": [],
    "equipment": [],
    "role": []
  }
]
```
<span id="get-single-user"></span>
### Get single user
[[Back to top](#)]

##### Request path
```
GET /api/users/:id
```

##### Response
```
{
    "_id": "584b060d27ce132fd59f4905",
    "updatedAt": "2016-12-09T19:29:17.587Z",
    "createdAt": "2016-12-09T19:29:17.587Z",
    "username": "kevin@mean.com",
    "__v": 0,
    "productions": [],
    "skills": [],
    "equipment": [],
    "role": []
 }
```
<span id="update-single-user"></span>
### Update single user
[[Back to top](#)]

##### Request path
```
PATH /api/users/:id
```

##### Request body

```
TBD
```

##### Response
```
TBD
```
<span id="delete-single-user"></span>
### Delete single user
[[Back to top](#)]
##### Request path
```
DELETE /api/users/:id
```

##### Response
```
{
	"success": true
}
```

##### Auth
```
POST 	/user/register
POST 	/user/register?addTo=:id
POST	/user/login
GET 	/user/logout
GET 	/user/status
```

##### Productions
```
GET		/api/productions		=> All productions by logged in user
POST	/api/productions		=> New productions associated to the logged in user
GET		/api/productions/:id	=> Single production by ID
PATCH	/api/productions/:id	=> Update single production
DELTE	/api/productions/:id	=> Delete single production
```

##### Crews
```
GET		/api/offers/			=> All offers
POST	/api/offers/			=> New offer
GET		/api/offers/:id			=> Single offer
PATCH	/api/offers/:id			=> Update single offer
DELETE	/api/offers/:id			=> Delete single offer
POST	/api/offers/:id/message	=> Add message to offer
```
