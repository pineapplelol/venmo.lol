<img align="left" width="125" height="125" src="https://pineapple.lol/asset/fronz.png">

# venmo.lol

A graph visualization of a payment network over Venmo. Can view a specific user's payment network, and will search transactions to a degree to 3. View at [venmo.lol](http://venmo.lol).

---

## Usage

Live project deployed at [venmo.lol](http://venmo.lol).

### Running Locally

Clone this repository and `yarn && yarn start`. Visit [http://localhost:3000](http://localhost:3000) in your browser. API's will not work until you create a `.env` file with `REACT_APP_VENMOLOL_API`.

## APIs

The project requires an API to return public user information and transactions. It expects the format to be

```
{
  "info": {
    "name": string,
    "img": string,
    "venmoSince": string,
    "isPrivate": boolean
  },
  "transactions": [
    {
      "sender": string,
      "recipient": string,
      "message": string,
      "transactionType": string,
      "date": string
    },
    ...
  ]
}
```

## Technology

Built with [React](https://reactjs.org/) using [Ant Design](https://ant.design/) components.

Uses [ESLint](https://eslint.org) with [Prettier](https://prettier.io/) and the [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript).

Uses [Flow](https://flow.org/) type checking.

### Code Quality

To lint, `yarn lint`, `yarn format` for code formatting, and for flow type checking, `yarn flow`.

## Partners

<a href="https://vercel.com?utm_source=pineapplelol&utm_campaign=oss"><img style="padding-top: 15px; width: 150px;" src="public/powered-by-vercel.svg" /></a>
