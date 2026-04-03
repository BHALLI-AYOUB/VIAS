# VIAS - Declaration et Historique des Machines

Application React + Vite + Tailwind pour:

- declarer les machines disponibles par site
- envoyer la declaration par EmailJS / WhatsApp
- enregistrer les declarations dans Supabase
- suivre l'historique complet des mouvements machine

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez ensuite les variables dans `.env`.

## Variables d'environnement

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_RECIPIENT_EMAIL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Commandes

```bash
npm run dev
npm run build
npm run preview
```

## Routes

- `/` : formulaire de declaration
- `/admin/login` : connexion admin
- `/admin/verify-email-code` : verification admin par code email
- `/historique` : recherche historique et timeline
- `/machines/:id` : detail machine

## Mise en place Supabase

1. Creez un projet Supabase.
2. Ouvrez l'editeur SQL Supabase.
3. Executez le fichier:

```text
supabase/migrations/001_create_machine_tracking_tables.sql
```

4. Executez ensuite les migrations de securite et de verification admin:

```text
supabase/migrations/002_admin_auth_policies.sql
supabase/migrations/003_create_admin_email_verifications.sql
```

5. Executez ensuite le seed:

```text
supabase/seed.sql
```

6. Recuperez:

- `Project URL`
- `anon public key`

7. Placez-les dans `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

8. Deployer la fonction d'envoi du code admin:

```bash
supabase functions deploy send-admin-verification-code --no-verify-jwt
```

9. Configurer les secrets de la fonction:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set ADMIN_VERIFICATION_FROM_EMAIL=your-verified-sender@example.com
```

10. Si la fonction a deja ete deployee avant cette mise a jour, redeployez-la pour appliquer la configuration CORS/JWT:

```bash
supabase functions deploy send-admin-verification-code --no-verify-jwt
```

## Comment fonctionne l'historique

- La table `machines` conserve l'etat courant.
- La table `machine_movements` conserve toutes les transitions.
- La table `daily_declarations` conserve l'entete de declaration.
- La table `declaration_machine_items` conserve les machines declarees.

Lorsqu'une declaration est soumise:

1. la declaration est enregistree
2. les machines selectionnees sont rattachees a cette declaration
3. la localisation courante de chaque machine est comparee a la nouvelle localisation
4. si elle change, un mouvement `transfert` est cree
5. la localisation courante de la machine est mise a jour

## Seed des machines

Le seed utilise l'inventaire stable deja present dans `src/data/machines.js`.
Le fichier `supabase/seed.sql` insere un jeu realiste de machines et quelques mouvements d'exemple pour tester la timeline.

## Services applicatifs

- `src/services/machineService.js`
- `src/services/historyService.js`
- `src/services/declarationService.js`

## Notes de production

- Aucun secret n'est hardcode.
- Supabase est configure uniquement via variables d'environnement.
- Si Supabase n'est pas configure, l'UI reste navigable, mais l'historique distant et l'ecriture base de donnees seront limites.
