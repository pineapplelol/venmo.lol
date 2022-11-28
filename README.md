<img align="left" width="125" height="125" src="https://pineapple.lol/asset/fronz.png">

# venmo.lol

A graph visualization of a payment network over Venmo. Can view a specific user's payment network, and will search transactions to a degree to 3.

---

https://user-images.githubusercontent.com/7104017/204367083-126ee2e7-2646-45ca-a4ec-31fa285140cb.mp4

## Usage

Unfortunately due to changes in Venmo's profile pages, this project can no longer be hosted. You should run locally by cloning this repository and `npm install && npm start`. Visit [http://localhost:3000](http://localhost:3000) in your browser. No visualization will be shown until you provide an API by creating a `.env` file with `REACT_APP_VENMOLOL_API`.

## APIs

The project requires an API to return public user information and transactions. It expects the format to be

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "name": "string",
    "dateJoined": "string",
    "profilePictureURL": "string"
  },
  "transactions": [
    {
      "date": "string",
      "note": "string",
      "action": "string",
      "actor": {
        "name": "string",
        "username": "string"
      },
      "target": {
        "name": "string",
        "username": "string"
      }
    }
  ]
}
```

## Technology

Built with [React](https://reactjs.org/) using [Ant Design](https://ant.design/) components.

Uses [ESLint](https://eslint.org) with [Prettier](https://prettier.io/) and the [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript) with [Flow](https://flow.org/) for type checking.

### Code Quality

To lint, `npm run lint`, `npm run format` for code formatting, and for type checking, `npm run flow`.

## Partners

<a href="https://vercel.com?utm_source=pineapplelol&utm_campaign=oss"><img style="padding-top: 15px; width: 150px;" src="public/powered-by-vercel.svg" /></a>
