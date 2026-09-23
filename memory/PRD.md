# Glowmatch — PRD

## Problem Statement
Glowmatch est un comparateur intelligent de produits cosmétiques et de maquillage + module d'essayage virtuel par IA. Site gratuit pour les utilisatrices, modèle économique par affiliation.

## Architecture
- **Backend**: FastAPI (port 8001), in-memory product catalog (`backend/catalog.py`), endpoints `/api/categories`, `/api/products`, `/api/products/top`, `/api/products/{id}`, `/api/ai/select-products` (Claude Sonnet 4.5), `/api/ai/apply-makeup` (Gemini Nano Banana). EMERGENT_LLM_KEY in backend/.env.
- **Frontend**: React 19 + Tailwind + shadcn/ui. Poppins (Google Fonts) + Bodoni Moda italic for editorial accents. React Router. localStorage wishlist.
- **AI**: Anthropic Claude Sonnet 4.5 for product selection (JSON output). Gemini Nano Banana (gemini-3.1-flash-image-preview) for makeup application on photo.

## User Personas
- Femme 18–45 ans cherchant à comparer cosmétiques selon type de peau, budget, ingrédients
- Curieuse voulant essayer virtuellement un maquillage avant achat
- Consommatrice attentive aux ingrédients (vegan, sans paraben, bio)

## Core Requirements (static)
- Couleurs imposées : fond #FFFFFF, H1 #FEC4D2, H2/H3 #79C1E0, CTA alternance, cards contour #FEC4D2
- Typographie : Poppins + Bodoni italique pour mots-clés
- Mega menu 3 catégories (Visage/Corps/Cosmétiques) avec sous-catégories en 2 colonnes
- Pop-up critères à l'entrée des pages comparateur
- Sidebar filtres temps réel + grille cards
- Module IA : upload photo → presets ou texte → loader séquentiel → résultat 2 colonnes avec hotspots interactifs
- Lien affilié sur chaque card produit
- Wishlist localStorage

## Implemented (2026-02-10)
- Backend complet : catalogue ~45 produits, endpoints CRUD + 2 endpoints IA (Claude + Nano Banana) ✅ 100% tests pass
- Frontend complet : Homepage (Hero + Comment ça marche + 2 modules + Podium top mois + Bannière IA + Footer), Mega menu, Page comparateur (popup + filtres + grille), Page essayage IA (upload + presets/texte + loader + résultat hotspots), Page wishlist ✅ 100% tests pass
- Détection HEX teint utilisatrice côté navigateur via Canvas
- Toast notifications via sonner

## Backlog (Next Phase)
- **P1** Élargir le catalogue à plusieurs milliers de produits réels (scraping ou import partenaires)
- **P1** Authentification (JWT ou Google Auth Emergent) + sauvegarde des looks IA en base
- **P1** Object storage pour héberger les images IA générées (partage Instagram/Pinterest)
- **P2** Page "Mon problème de peau" dédiée par condition (acné, taches, etc.)
- **P2** Analytics affiliation (tracking clics, conversion)
- **P2** Filtre par marque favorite multi-sélect dans la sidebar
- **P2** Mode mobile mega menu (accordion drawer)
- **P3** Comparaison côte-à-côte de 2-3 produits sélectionnés
- **P3** Newsletter mensuelle "Top du mois"

## Known Limitations
- Catalogue actuel = demo (~45 produits)
- Pas d'auth → wishlist par device seulement
- Hotspots IA placés par position fixe par zone, pas par détection faciale
