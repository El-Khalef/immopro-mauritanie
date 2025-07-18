#!/bin/bash
# Script pour sauvegarder automatiquement sur GitHub

echo "🚀 Sauvegarde automatique vers GitHub..."

# Vérifier si Git est initialisé
if [ ! -d ".git" ]; then
    echo "Initialisation de Git..."
    git init
    git branch -M main
    # Utiliser le token GitHub pour l'authentification
    git remote add origin https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/El-khalef/immopro-mauritanie.git
fi

# Configurer l'authentification Git avec le token
git remote set-url origin https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/El-khalef/immopro-mauritanie.git

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec timestamp
git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M:%S')"

# Pousser vers GitHub
git push origin main

echo "✅ Sauvegarde terminée !"