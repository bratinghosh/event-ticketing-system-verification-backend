# event-ticketing-system-verification-backend
## Event Ticketing System Verification Service

## Setup
1. Create `.env` file and the following:
```
PORT=3000
DATABASE_URL=<URL>
```

## MongoDB Database Setup
1. Login to MongoDB (https://account.mongodb.com/account/login).
2. Create a database and user.
3. Copy the url from the website to the `.env` file.

## Start Server
`npm start`

## Packages
* express
* mongoose
* nodemon
* dotenv
* crypto

## Schemas
Account
```
{
    wallet_address: STRING,
    hash: STRING,
    tickets: [STRING]
}
```
