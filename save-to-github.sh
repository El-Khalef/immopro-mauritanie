#!/bin/bash
# Script pour sauvegarder automatiquement sur GitHub

echo "🚀 Sauvegarde automatique vers GitHub..."

# Vérifier si Git est initialisé
if [ ! -d ".git" ]; then
    echo "Initialisation de Git..."
    git init
    git branch -M main
    git remote add origin https://github.com/El-Khalef/immopro-mauritanie.git
fi

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec timestamp
git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M:%S')"

# Pousser vers GitHub
git push origin main

echo "✅ Sauvegarde terminée !"