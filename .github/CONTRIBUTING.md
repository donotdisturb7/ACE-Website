# Guide de Contribution - ACE Website

Merci de contribuer au projet ACE Escape Game ! 

## 🌿 Stratégie de Branches

Nous utilisons le workflow Git Flow :

### Branches principales

- `main` : Code en production, toujours stable
- `develop` : Branche de développement, intègre les features

### Branches de travail

- `feature/*` : Nouvelles fonctionnalités (ex: `feature/team-management`)
- `bugfix/*` : Corrections de bugs (ex: `bugfix/email-validation`)
- `hotfix/*` : Corrections urgentes en production
- `release/*` : Préparation de releases

## 📝 Convention de nommage

### Branches

```
feature/nom-de-la-fonctionnalite
bugfix/description-du-bug
hotfix/correction-urgente
release/v1.2.0
```

### Commits

Utilisez des messages de commit clairs et descriptifs :

```
feat: ajouter la gestion des équipes
fix: corriger la validation email
docs: mettre à jour le README
style: formater le code backend
refactor: réorganiser les composants
test: ajouter tests unitaires auth
chore: mettre à jour les dépendances
```

## 🔄 Workflow de développement

### 1. Créer une branche feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 2. Développer et commiter

```bash
# Faire vos modifications
git add .
git commit -m "feat: description de la fonctionnalité"
```

### 3. Pousser et créer une Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Créez une Pull Request vers `develop` sur GitHub.

### 4. Code Review

- Au moins 1 approbation requise
- Les tests CI doivent passer
- Résolvez les commentaires de review

### 5. Merge

Une fois approuvée, la PR sera mergée dans `develop`.

## 🧪 Tests

Avant de créer une PR :

```bash
# Backend
cd backend
npm run lint
npm run build

# Frontend
cd frontend
npm run lint
npm run build

# Docker
docker compose build
docker compose up -d
```

## 📋 Standards de code

### TypeScript

- Utilisez TypeScript strict mode
- Typez toutes les fonctions et variables
- Évitez les `any`
- Commentaires en français, code en anglais

### React/Next.js

- Composants fonctionnels avec hooks
- Utilisez TypeScript pour les props
- Commentaires JSDoc si nécessaire

### Backend

- Controllers séparés des routes
- Services pour la logique métier
- Middleware pour les validations
- Gestion d'erreurs avec try/catch

## 🎨 Style

### Prettier/ESLint

Le projet utilise ESLint pour le linting. Respectez la configuration.

### Tailwind CSS

- Utilisez les classes Tailwind existantes
- Palette de couleurs du projet (neon-rose, midnight-blue, etc.)
- Mobile-first responsive design

## 📦 Dépendances

- Ajoutez uniquement les dépendances nécessaires
- Documentez les nouvelles dépendances dans le README
- Utilisez des versions spécifiques (pas de `^` ou `~`)

## 🐛 Signaler un bug

Créez une issue avec :
- Description claire du problème
- Étapes pour reproduire
- Comportement attendu vs actuel
- Captures d'écran si pertinent
- Environnement (OS, navigateur, etc.)

## 💡 Proposer une fonctionnalité

Créez une issue avec :
- Description de la fonctionnalité
- Cas d'usage
- Impact sur le projet
- Mockups/wireframes si possible

## 🚀 Release

Les releases sont créées depuis `main` :

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 📞 Contact

Pour toute question :
- Issues GitHub
- Email : admin@ace-escapegame.com

---

Merci pour votre contribution ! 🎉


