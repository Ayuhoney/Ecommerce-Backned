
# Ecommerce - App
In this App user can signUp , login and add products  into his cart  then place order or  canceled our order.

## Run Locally

Install dependencies

```http
  npm Install
```
inside the src run command
```http
  nodemon index.js
```
# API Reference :- 

## token will be send in headers "x-api-key"

## User Routes

### SignUP User
```http
POST/signUp
```
### Login User

```http
POST/login
```
### forgot password
#### send link to provide email
```http
POST/forgotPassword      required email in body
```
### update our password after verifying emailToken

```http
PUT/resetPassword?token=emailToken
```
### Logout User (Required-token)

```http
GET/logout
```

### Refresh token
```http
POST/refresh-token
``` 

| req.body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `refreshToken` | `string` | **Required**. |


## Product Routes
### Create Product

```http
POST/product
```
## Cart Routes

###  create or Add Cart (Required-token)
```http
POST/cart
```
### Get CartDetails (Required-token)
```http
GET/cart
```

## Order Routes

### create Order  (Required-token)
```http
POST/order
```

### Get OrderDetails  (Required-token)

```http
GET/order
```

### cancelOrder (Required-token)
```http
PUT/order
```


## Environment Variables

Before run  this project,  add the following environment variables to your .env file

PORT

DB_URL

JWT_SECRET

REF_TOKEN_SECRET

REF_TOKEN_EXPIRE


JWT_EXPIRE

EMAIL_PASS





## Authors

- [Ayush Sharma]()

