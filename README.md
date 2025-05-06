# 🛠️ projectSetup

Questo repository contiene una configurazione base **pronta all’uso** per iniziare nuovi progetti JavaScript (e opzionalmente React) con:

- ✅ ESLint moderno (ESM config)
- ✅ Prettier integrato in ESLint
- ✅ `.prettierrc` con stile opinato
- ✅ Plugin già installati per browser + Node
- ✅ Comandi `npm run lint` e `npm run lint:fix`
- ✅ Pronto per essere clonato e adattato a nuovi progetti

---

## 🚀 Come usarlo per un nuovo progetto

### 1. Clona il template

```bash
git clone https://github.com/bubbosvilup/projectSetup.git nome-nuovo-progetto
```

### 2. Entra nella cartella

```bash
cd nome-nuovo-progetto
```

### 3. Rimuovi il collegamento al repository originale

```bash
rm -rf .git
```

### 4. (Facoltativo) Crea il tuo nuovo repo

```bash
git init
git add .
git commit -m "Setup iniziale"
```

Poi puoi collegarlo a un nuovo repo GitHub se vuoi.

Installa le dipendenze

```bash
npm install
```

## ⚛️ Se vuoi usare React

### Installa anche questi plugin ESLint:

```bash
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y
Poi aggiorna eslint.config.mjs con:
```

// Dentro defineConfig:

```bash
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

plugins: {
  prettier: prettierPlugin,
  react: reactPlugin,
  'react-hooks': reactHooks,
  'jsx-a11y': jsxA11y,
},
rules: {
  // Prettier + JS rules...
  ...reactPlugin.configs.recommended.rules,
  ...jsxA11y.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules,
}
```

## 🧠 Autore

Nicco aka bubbosvilup
🐙 https://github.com/bubbosvilup
