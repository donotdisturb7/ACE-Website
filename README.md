# ACE Escape Game 2025 - Site d'Inscription

Site web pour gérer les inscriptions et le suivi de la ACE 2025

## Fonctionnalités

### Participants
- Inscription avec validation email
- Création d'équipes (3-5 personnes)
- Code d'invitation pour rejoindre une équipe
- Dashboard avec informations d'équipe, score et classement

### Administrateurs
- Statistiques en temps réel
- Gestion des 4+ salles simultanées
- Attribution des équipes aux salles
- Démarrage/arrêt des sessions par salle
- Export CSV des inscriptions
- Synchronisation avec CTFd

## Stack Technique

**Frontend**
- Next.js 16.0.3 (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL avec Sequelize ORM
- Redis
- JWT pour l'authentification

**Infrastructure**
- Docker Compose
- Nginx (reverse proxy)
- MailHog (développement)

## Démarrage Rapide

### Prérequis
- Docker et Docker Compose
- Node.js 20+ (optionnel pour dev local)

### Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd ACE-website
```

2. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditez .env avec vos valeurs
```

3. Démarrer avec Docker
```bash
npm run dev
```

4. Accéder à l'application
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- MailHog : http://localhost:8025

### Compte Admin

Défini dans `.env` :
- Email : `admin@ace-escapegame.com`
- Mot de passe : Variable `ADMIN_PASSWORD`

## Structure du Projet

```
ACE-website/
├── backend/           # API Express + PostgreSQL
│   ├── src/
│   │   ├── config/    # Configuration (DB, Redis, env)
│   │   ├── models/    # Modèles Sequelize
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/  # Email, CTFd, Auth
│   │   └── middleware/
│   └── Dockerfile
├── frontend/          # Next.js Application
│   ├── app/           # Pages (App Router)
│   ├── components/    # Composants réutilisables
│   ├── lib/           # Utilities et types
│   └── Dockerfile
├── nginx/             # Configuration Nginx
├── docker-compose.yml
└── DEPLOYMENT.md
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-email` - Vérification email
- `GET /api/auth/profile` - Profil utilisateur

### Équipes
- `POST /api/teams/create` - Créer équipe
- `POST /api/teams/join` - Rejoindre équipe
- `GET /api/teams/my-team` - Mon équipe

### Admin
- `GET /api/admin/stats` - Statistiques
- `GET /api/admin/teams` - Liste équipes
- `GET /api/admin/export/csv` - Export CSV
- `POST /api/admin/rooms/assign` - Assigner salles
- `POST /api/admin/sessions/start` - Démarrer session

## Développement

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Guide de déploiement](./DEPLOYMENT.md)

## Licence

MIT

## Auteur

Rénald DESIRE - Vizyon Dijital
