# Volunteam App

## Setting up the fake API (json-server)

Update the file `src/services/api.ts`.

Before running your 'json-server', get your computer's IP address and update your baseURL to `http://your_ip_address_here:3333` and then run:

```
npx json-server --watch db.json --port 3333 --host your_ip_address_here -m ./node_modules/json-server-auth
```

To access your server online without running json-server locally, you can set your baseURL to:

```
https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>
```

To use `my-json-server`, make sure your `db.json` is located at the repo root.

## Setting up the image upload API

Pictures are uploaded to [Freeimage.host](https://freeimage.host/page/api). `src/services/imageApi.ts`
uses the public API key Freeimage.host publishes, so it works with no sign-up.

To use your own key instead, start the app with:

```
FREEIMAGE_API_KEY="insert_your_api_key_here" npx expo start
```

## Where the app looks for json-server

`src/services/api.ts` works this out automatically: `10.0.2.2` on the Android emulator, and on a
real phone the same computer IP that Expo/Metro is served from. To force an address, start Expo with
`API_URL="http://<ip>:3333"`.
