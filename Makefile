.PHONY: help setup start stop restart logs logs-backend logs-frontend logs-all status build rebuild clean fresh shell-backend shell-frontend shell-db test test-captcha test-all db-reset db-migrate db-seed

# Variables
DOCKER_COMPOSE = docker compose

help: ## Afficher l'aide
	@echo "Commandes disponibles pour ACE Website:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Creer le fichier .env depuis .env.example
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Fichier .env cree"; \
		echo "Editez .env avec vos valeurs (JWT_SECRET, passwords, etc.)"; \
	else \
		echo ".env existe deja"; \
	fi

start: ## Demarrer tous les services
	@echo "Demarrage du site ACE..."
	$(DOCKER_COMPOSE) up -d
	@echo ""
	@echo "Site ACE demarre"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:5000"
	@echo "  MailHog:   http://localhost:8025"
	@echo "  Postgres:  localhost:5433"

stop: ## Arreter tous les services
	$(DOCKER_COMPOSE) down
	@echo "Services arretes"

restart: ## Redemarrer tous les services
	$(DOCKER_COMPOSE) restart
	@echo "Services redemarres"

logs: logs-backend ## Afficher les logs du backend (alias)

logs-backend: ## Afficher les logs du backend
	$(DOCKER_COMPOSE) logs -f --tail=100 backend

logs-frontend: ## Afficher les logs du frontend
	$(DOCKER_COMPOSE) logs -f --tail=100 frontend

logs-all: ## Afficher tous les logs
	$(DOCKER_COMPOSE) logs -f --tail=50

status: ## Afficher l'etat des services
	@echo "Etat des services:"
	@$(DOCKER_COMPOSE) ps

build: ## Reconstruire les images
	@echo "Reconstruction des images..."
	$(DOCKER_COMPOSE) build
	@echo "Images reconstruites"

rebuild: ## Reconstruire et redemarrer les services
	@echo "Reconstruction et redemarrage..."
	$(DOCKER_COMPOSE) up -d --build
	@echo "Services reconstruits et redemarres"

rebuild-backend: ## Reconstruire uniquement le backend
	@echo "Reconstruction du backend..."
	$(DOCKER_COMPOSE) up -d --build backend
	@echo "Backend reconstruit et redemarre"

rebuild-frontend: ## Reconstruire uniquement le frontend
	@echo "Reconstruction du frontend..."
	$(DOCKER_COMPOSE) up -d --build frontend
	@echo "Frontend reconstruit et redemarre"

shell-backend: ## Ouvrir un shell dans le conteneur backend
	$(DOCKER_COMPOSE) exec backend /bin/sh

shell-frontend: ## Ouvrir un shell dans le conteneur frontend
	$(DOCKER_COMPOSE) exec frontend /bin/sh

shell-db: ## Ouvrir psql dans le conteneur postgres
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb

test: ## Tester l'acces aux services
	@echo "Test des services..."
	@curl -s http://localhost:5000/health > /dev/null && echo "✅ Backend accessible" || echo "❌ Backend inaccessible"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend accessible" || echo "❌ Frontend inaccessible"
	@curl -s http://localhost:8025 > /dev/null && echo "✅ MailHog accessible" || echo "❌ MailHog inaccessible"

test-captcha: ## Tester la securite hCaptcha (protection anti-spam)
	@echo "Lancement des tests de securite hCaptcha..."
	@echo "Assurez-vous que le backend est demarre (make start)"
	@echo ""
	cd backend && npx tsx tests/captcha-security.test.ts

test-all: test test-captcha ## Lancer tous les tests (services + CAPTCHA)

db-reset: ## Reinitialiser la base de donnees (perte de donnees)
	@echo "ATTENTION: Reinitialisation de la base de donnees !"
	@read -p "Confirmer ? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Arret du backend..."; \
		$(DOCKER_COMPOSE) stop backend; \
		echo "Suppression de la base..."; \
		$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d postgres -c "DROP DATABASE IF EXISTS acedb;"; \
		$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d postgres -c "CREATE DATABASE acedb;"; \
		echo "Redemarrage du backend..."; \
		$(DOCKER_COMPOSE) start backend; \
		echo "Base de donnees reinitialisee"; \
	else \
		echo "Annule"; \
	fi

db-migrate: ## Executer les migrations de la base de donnees
	$(DOCKER_COMPOSE) exec backend npm run db:migrate

db-seed: ## Executer les seeders (donnees initiales)
	$(DOCKER_COMPOSE) exec backend npm run db:seed

clean: ## Supprimer tous les conteneurs et volumes (perte de donnees)
	@echo "ATTENTION: Suppression de toutes les donnees !"
	@read -p "Confirmer ? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(DOCKER_COMPOSE) down -v --remove-orphans; \
		docker volume rm -f ace-website_postgres_data ace-website_redis_data 2>/dev/null || true; \
		echo "Nettoyage termine"; \
	else \
		echo "Annule"; \
	fi

fresh: ## Nettoyage complet + rebuild + redemarrage
	@echo "ATTENTION: Fresh start - Suppression totale des donnees !"
	@read -p "Confirmer ? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Arret des conteneurs..."; \
		$(DOCKER_COMPOSE) down -v --remove-orphans 2>/dev/null || true; \
		echo "Suppression des volumes..."; \
		docker volume rm -f ace-website_postgres_data ace-website_redis_data 2>/dev/null || true; \
		echo "Verification..."; \
		sleep 2; \
		echo "Reconstruction des images..."; \
		$(DOCKER_COMPOSE) build --no-cache; \
		echo "Demarrage..."; \
		$(DOCKER_COMPOSE) up -d; \
		echo ""; \
		echo "Fresh start termine !"; \
		echo "  Frontend: http://localhost:3000"; \
		echo "  Backend:  http://localhost:5000"; \
		echo "  Logs:     make logs"; \
		echo ""; \
		echo "Attendez 30 secondes pour l'initialisation complete"; \
	else \
		echo "Annule"; \
	fi

install-backend: ## Installer les dependances backend
	$(DOCKER_COMPOSE) exec backend npm install

install-frontend: ## Installer les dependances frontend
	$(DOCKER_COMPOSE) exec frontend npm install

lint-backend: ## Linter le code backend
	$(DOCKER_COMPOSE) exec backend npm run lint

lint-frontend: ## Linter le code frontend
	$(DOCKER_COMPOSE) exec frontend npm run lint
