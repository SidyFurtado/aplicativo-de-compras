# Setup no Mac

## Rodar o app

```sh
npm run web
```

Depois abra:

```txt
http://localhost:8081
```

## Firebase

Crie ou abra um projeto no Firebase Console e adicione um app do tipo Web.

No arquivo `.env`, cole os dados do `firebaseConfig` usando estes nomes:

```sh
EXPO_PUBLIC_FIREBASE_API_KEY=SUA_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
EXPO_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx
```

## Login com Google

No Firebase Console:

1. Abra `Authentication`.
2. Clique em `Get started`, se aparecer.
3. Em `Sign-in method`, habilite `Google`.
4. Em `Settings > Authorized domains`, confirme que `localhost` está autorizado.

## Banco de dados

No Firebase Console:

1. Abra `Firestore Database`.
2. Clique em `Create database`.
3. Para uso pessoal/local, comece em test mode.
4. Escolha uma região próxima e conclua.

O app cria as coleções automaticamente quando você adicionar dados: `lists`, `items`, `purchases` e `budgets`.
