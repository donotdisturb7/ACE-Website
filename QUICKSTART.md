# Démarrage Rapide - ACE 2025

Guide pour lancer le projet en moins de 5 minutes.

## Installation

```bash
# Cloner et accéder au projet
git clone <repository-url>
cd ACE-website

# Copier le fichier de configuration
cp .env.template .env

# Éditer .env avec vos valeurs (OBLIGATOIRE)
nano .env

# Démarrer avec Docker
npm run dev
```

## Accès

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Compte Admin

Défini dans `.env`:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

## Configuration SMTP (Gmail)

1. Créer un mot de passe d'application sur https://myaccount.google.com/apppasswords
2. Utiliser ce mot de passe dans `.env` → `SMTP_PASS`

## Commandes Utiles

```bash
# Voir les logs
npm run logs

# Arrêter
npm run stop

# Redémarrer proprement
docker compose down -v && npm run dev
```

## Problèmes Courants

### Port déjà utilisé

```bash
lsof -i :3000
kill -9 <PID>
```

### Base de données ne démarre pas

```bash
docker compose down -v
docker compose up -d
```

### Emails ne partent pas

Vérifier `SMTP_USER` et `SMTP_PASS` dans `.env`. Pour Gmail, utiliser un mot de passe d'application.

## Documentation Complète

- [README.md](./README.md) - Vue d'ensemble
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement
