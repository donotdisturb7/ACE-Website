# 🚀 Démarrage Rapide - ACE 2025

Guide ultra-rapide pour lancer le projet en moins de 5 minutes.

## ⚡ Installation Express (Docker)

```bash
# 1. Cloner et accéder au projet
git clone <repository-url>
cd ACE-website

# 2. Copier le fichier de configuration
cp .env.template .env

# 3. Éditer .env avec vos valeurs (OBLIGATOIRE)
nano .env  # ou vim, code, etc.

# 4. Démarrer TOUT avec Docker
npm run dev

# 5. Accéder à l'application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## 🔐 Compte Admin par Défaut

Défini dans votre fichier `.env` :
- Email : `ADMIN_EMAIL`
- Password : `ADMIN_PASSWORD`

**⚠️ CHANGEZ CES VALEURS en production !**

## 📧 Configuration SMTP (Gmail)

1. Allez sur https://myaccount.google.com/apppasswords
2. Créez un mot de passe d'application
3. Utilisez-le dans `.env` → `SMTP_PASS`

## 🎮 Premiers Pas

### 1. Se connecter en admin
```
1. Allez sur http://localhost:3000
2. Cliquez "Connexion"
3. Utilisez les credentials admin de .env
4. Cliquez sur "Admin" en haut à droite
```

### 2. Tester l'inscription
```
1. Ouvrez une fenêtre privée
2. Cliquez "S'inscrire"
3. Remplissez le formulaire
4. Vérifiez votre email
5. Créez ou rejoignez une équipe
```

### 3. Gérer les équipes (Admin)
```
1. Dashboard Admin → onglet "Équipes"
2. Voir toutes les équipes inscrites
3. Assigner les équipes aux salles (1-4)
4. Démarrer les sessions
```

## 🐛 Problèmes Courants

### Port déjà utilisé

```bash
# Voir qui utilise le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans docker compose.yml
```

### Base de données ne démarre pas

```bash
# Réinitialiser complètement
docker compose down -v
docker compose up -d
```

### Emails ne partent pas

- Vérifiez `SMTP_USER` et `SMTP_PASS` dans `.env`
- Pour Gmail, utilisez un mot de passe d'application
- Vérifiez les logs : `docker compose logs backend | grep SMTP`

## 📚 Commandes Utiles

```bash
# Voir les logs
npm run logs

# Voir les logs backend uniquement
npm run logs:backend

# Voir les logs frontend uniquement
npm run logs:frontend

# Arrêter tout
npm run stop

# Tout supprimer (DB incluse) et recommencer
docker compose down -v && npm run dev
```

## 🎯 Accès Rapides

- **Landing Page** : http://localhost:3000
- **Inscription** : http://localhost:3000/register
- **Connexion** : http://localhost:3000/login
- **Dashboard** : http://localhost:3000/dashboard
- **Admin** : http://localhost:3000/admin
- **API Health** : http://localhost:5000/health

## 📖 Documentation Complète

- [README.md](./README.md) - Vue d'ensemble
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide complet de déploiement
- [CONTRIBUTING.md](./.github/CONTRIBUTING.md) - Guide de contribution

## 💡 Besoin d'aide ?

- **Documentation** : Lisez DEPLOYMENT.md
- **Bugs** : Ouvrez une issue GitHub
- **Questions** : admin@ace-escapegame.com

---

Prêt à organiser le meilleur escape game cybersécurité ! 🎉


