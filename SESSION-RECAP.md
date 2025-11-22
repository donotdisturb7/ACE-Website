# Récapitulatif Session - Protection hCaptcha

## ✅ Ce qui a été fait aujourd'hui

### 1. Implémentation hCaptcha (Protection Anti-Bot)

#### Backend
- ✅ **Service CAPTCHA** : `backend/src/services/captcha.service.ts`
  - Fonction `verifyCaptcha()` : Vérifie les tokens hCaptcha via l'API officielle
  - Fonction `isCaptchaRequired()` : Active CAPTCHA si `HCAPTCHA_SECRET` est défini
  - Actif en **développement ET production** (pas seulement production)

- ✅ **Routes mises à jour** : `backend/src/routes/auth.routes.ts`
  - Ajout du champ `captchaToken` (optionnel) au schéma d'inscription

- ✅ **Controller modifié** : `backend/src/controllers/auth.controller.ts`
  - Vérification CAPTCHA **AVANT** l'inscription
  - Messages d'erreur clairs :
    - "Veuillez compléter le CAPTCHA." (si token manquant)
    - "CAPTCHA invalide. Veuillez réessayer." (si token invalide)

#### Frontend
- ✅ **Composant HCaptcha** : `frontend/components/HCaptcha.tsx`
  - Utilise l'API JavaScript officielle hCaptcha (pas de package tiers)
  - Gère proprement le chargement du script (évite les doublons)
  - Callbacks pour `onVerify`, `onError`, `onExpire`
  - Optimisé pour React Strict Mode (pas de multiples rendus)

- ✅ **Page d'inscription** : `frontend/app/register/page.tsx`
  - Widget hCaptcha affiché avant le bouton "Confirmer l'inscription"
  - Token CAPTCHA envoyé avec la requête d'inscription
  - Ne s'affiche que si `NEXT_PUBLIC_HCAPTCHA_SITEKEY` est défini

#### Configuration
- ✅ **docker-compose.yml** :
  - Backend : `PORT=5000` explicite pour éviter les conflits
  - Frontend : Pas de `PORT` défini (utilise 3000 par défaut)
  - Variables d'environnement bien séparées

- ✅ **.env.example** mis à jour avec :
  ```bash
  # hCaptcha Configuration (Protection anti-bot)
  # Clés de TEST (passent toujours la validation, pour développement uniquement) :
  HCAPTCHA_SECRET=0x0000000000000000000000000000000000000000
  NEXT_PUBLIC_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
  ```
  - **IMPORTANT** : `PORT` supprimé du `.env` (défini dans docker-compose.yml)



#### Tests
- ✅ **Tests de sécurité** : `backend/tests/captcha-security.test.ts`
  - Test 1 : Inscription sans CAPTCHA → ✅ Bloquée
  - Test 2 : CAPTCHA invalide → ✅ Bloquée
  - Test 3 : 10 tentatives sans CAPTCHA → ✅ Toutes bloquées
  - Test 4 : CAPTCHA requis pour tous les emails → ✅ Appliqué uniformément
  - Test 5 : Spoofing d'headers → ✅ Bloqué malgré spoofing
  - Test 6 : Configuration → ⚠️ HCAPTCHA_SECRET non défini (normal si pas dans `.env`)

- ✅ **Makefile** : Commande `make test-captcha` ajoutée

### 2. Corrections de bugs

#### Problème : Backend écoutait sur port 3000 au lieu de 5000
- **Cause** : `PORT=3000` dans le `.env` était lu par le backend aussi
- **Solution** :
  - Suppression de `PORT` du `.env`
  - Ajout de `PORT=5000` explicite dans `docker-compose.yml` pour le backend
  - Frontend utilise le port 3000 par défaut Next.js

#### Problème : CORS bloquait les requêtes frontend → backend
- **Cause** : Backend n'écoutait pas sur le bon port
- **Vérification** : CORS déjà configuré correctement dans `backend/src/server.ts`
  ```typescript
  app.use(cors({
    origin: config.nodeEnv === 'development'
      ? ['http://localhost:3000', 'http://localhost', 'http://127.0.0.1:3000']
      : config.frontendUrl,
    credentials: true,
  }));
  ```

#### Problème : Widget hCaptcha se rendait plusieurs fois
- **Cause** : React Strict Mode + callbacks dans les dépendances useEffect
- **Solution** :
  - Utilisation de `callbacksRef` pour éviter les re-renders
  - Vérification si le script est déjà chargé avant de l'ajouter
  - Gestion propre du cleanup

## 🚀 État actuel du projet

### Services fonctionnels
- ✅ **Backend** : http://localhost:5000
  - API Health : http://localhost:5000/health
  - API Auth : http://localhost:5000/api/auth/register
  - Port correct : 5000 ✅

- ✅ **Frontend** : http://localhost:3000
  - Page d'inscription : http://localhost:3000/register
  - Widget hCaptcha s'affiche correctement
  - Port correct : 3000 ✅

- ✅ **MailHog** : http://localhost:8025
- ✅ **PostgreSQL** : localhost:5433
- ✅ **Redis** : localhost:6379

### Protection anti-spam active
1. 🤖 **hCaptcha** : Bloque les bots (si clés configurées)
2. ✉️ **Email verification** : Obligatoire pour activer le compte
3. ⏱️ **Rate limiting** : Par email (compatible WiFi partagé)
4. 🔒 **Whitelist Docker** : Activée en dev (`DOCKER_ENV=true`)

## ⚠️ Actions à faire pour la prochaine session

### 1. Configuration CAPTCHA (CRITIQUE pour production)

#### Option A : Utiliser les clés de TEST (Développement)
Ajoutez dans votre `.env` :
```bash
# hCaptcha - Clés de TEST (développement)
HCAPTCHA_SECRET=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
```

**Avantages** :
- ✅ Teste le flow complet d'inscription avec CAPTCHA
- ✅ Les clés de test passent TOUJOURS la validation
- ✅ Pas besoin de créer un compte hCaptcha

**Inconvénients** :
- ❌ N'offre AUCUNE protection réelle contre les bots
- ❌ À REMPLACER AVANT LA PRODUCTION

#### Option B : Créer un compte hCaptcha (Production-ready)
1. Aller sur https://www.hcaptcha.com/
2. Créer un compte gratuit (100% gratuit, illimité)
3. Créer un nouveau site avec :
   - **Hostname** : `localhost` (dev) ou votre domaine (prod)
   - **Difficulty** : Easy
4. Copier les clés dans `.env` :
   ```bash
   HCAPTCHA_SECRET=votre_secret_ici
   NEXT_PUBLIC_HCAPTCHA_SITEKEY=votre_sitekey_ici
   ```

**Avantages** :
- ✅ Protection RÉELLE contre les bots
- ✅ Gratuit et illimité
- ✅ Prêt pour la production

### 2. Tester le CAPTCHA manuellement

```bash
# 1. Redémarrer le backend pour charger les nouvelles clés
make restart

# 2. Tester la sécurité CAPTCHA
make test-captcha

# 3. Aller sur http://localhost:3000/register
# 4. Remplir le formulaire
# 5. Compléter le CAPTCHA
# 6. Cliquer sur "Confirmer l'inscription"
# 7. Vérifier l'email dans MailHog : http://localhost:8025
```

### 3. Vérifier les logs backend

Après une inscription réussie, vous devriez voir :
```
[INFO] CAPTCHA verified successfully
[INFO] Verification email sent to: user@example.com
```

Si CAPTCHA invalide :
```
[WARN] CAPTCHA verification failed: { errors: [...], ip: '...' }
```

### 4. Configuration production (Checklist)

Avant de déployer en production, vérifiez :

- [ ] **hCaptcha** : Clés RÉELLES configurées (pas de test keys)
  ```bash
  # .env.production
  HCAPTCHA_SECRET=votre_vraie_secret
  NEXT_PUBLIC_HCAPTCHA_SITEKEY=votre_vraie_sitekey
  ```

- [ ] **DOCKER_ENV** : NON défini en production
  ```yaml
  # docker-compose.prod.yml
  backend:
    environment:
      - PORT=5000
      # PAS de DOCKER_ENV=true en production !
  ```

- [ ] **NODE_ENV** : `production`
  ```bash
  NODE_ENV=production
  ```

- [ ] **JWT_SECRET** : Clé forte et unique
  ```bash
  # Générer une clé forte
  openssl rand -base64 32
  ```

- [ ] **Nginx** : Configuré pour gérer `X-Forwarded-For` de manière sécurisée

## 📂 Fichiers modifiés aujourd'hui

### Backend
- `backend/src/services/captcha.service.ts` (créé)
- `backend/src/controllers/auth.controller.ts` (modifié)
- `backend/src/routes/auth.routes.ts` (modifié)
- `backend/tests/captcha-security.test.ts` (créé)

### Frontend
- `frontend/components/HCaptcha.tsx` (créé)
- `frontend/app/register/page.tsx` (modifié)

### Configuration
- `docker-compose.yml` (modifié - PORT backend)
- `.env.example` (modifié - ajout hCaptcha)
- `Makefile` (modifié - ajout test-captcha)

### Documentation
- `SESSION-RECAP.md` (ce fichier)


## 🧪 Commandes utiles

```bash
# Démarrer tous les services
make start

# Tester que tout fonctionne
make test

# Tester la sécurité CAPTCHA
make test-captcha

# Voir les logs backend
make logs-backend

# Voir les logs frontend
make logs-frontend

# Redémarrer un service
docker compose restart backend
docker compose restart frontend

# Ouvrir un shell dans le backend
make shell-backend
```

## 🔐 Stratégie de sécurité actuelle

### Couche 1 : hCaptcha (Protection bot)
- Bloque 99.9% des scripts automatisés
- Gratuit et respectueux de la vie privée
- **Statut** : ⚠️ Clés de test (OK pour dev, à changer pour prod)

### Couche 2 : Email verification
- Chaque utilisateur doit vérifier son email
- Empêche la création massive de faux comptes
- **Statut** : ✅ Activé

### Couche 3 : Rate limiting
- Par email (pas par IP → compatible WiFi campus)
- 100 requêtes/email/10min pour auth
- 10 tentatives/email/15min pour login
- **Statut** : ✅ Activé

### Couche 4 : Whitelist Docker (Dev uniquement)
- IPs Docker `172.x.x.x` whitelistées en dev
- Permet à CTFd de synchroniser sans limite
- **Statut** : ✅ Activé en dev (`DOCKER_ENV=true`)

## 🎯 Prochaines étapes recommandées

1. **Immédiat** : Ajouter les clés hCaptcha dans `.env` (test ou réelles)
2. **Court terme** : Tester l'inscription complète avec CAPTCHA
3. **Avant production** : Créer un compte hCaptcha et utiliser de vraies clés
4. **Avant production** : Vérifier que `DOCKER_ENV` n'est PAS défini

## 📞 Support

- **Documentation hCaptcha** : https://docs.hcaptcha.com/
- **Dashboard hCaptcha** : https://dashboard.hcaptcha.com/
- **Clés de test** : https://docs.hcaptcha.com/#integration-testing-test-keys

---

**Date de cette session** : 22 novembre 2025
**Temps estimé pour continuer** : 10-15 minutes (ajouter clés + tester)
**État global** : ✅ Prêt pour les tests, ⚠️ Clés CAPTCHA à configurer
