# VIAS - Déclaration journalière des machines

Application React + Vite + Tailwind pour remplacer les appels téléphoniques quotidiens par une déclaration web simple ou détaillée.

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez ensuite vos variables EmailJS dans `.env`.

## Commandes

```bash
npm run dev
npm run build
npm run preview
```

## EmailJS

Variables attendues :

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_RECIPIENT_EMAIL`

Paramètres envoyés au template :

- `to_email`
- `reply_to`
- `subject`
- `message`
- `sender_name`
- `site_name`
- `declaration_date`

## Remplacer les données mock par un import Excel plus tard

1. Centraliser l'import dans un futur service `inventoryService`.
2. Lire le fichier source depuis un backend ou un stockage partagé.
3. Transformer les onglets `BASE MAT`, `POSITION MATERIEL` et `ATELIER ENROBE` vers le même schéma que `src/data/machines.js`.
4. Garder les normalisations de catégories et de localisations pour rester compatibles avec l'UI actuelle.

L'architecture actuelle sépare déjà :

- les données sources dans `src/data`
- la logique de formatage dans `src/utils`
- l'envoi email dans `src/services`

Cela permet d'ajouter plus tard une API ou une base de données sans refondre l'interface.
