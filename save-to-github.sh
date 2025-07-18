#!/bin/bash
# Script pour sauvegarder automatiquement sur GitHub

echo "🚀 Sauvegarde automatique vers GitHub..."

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec timestamp
git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M:%S')"

# Pousser vers GitHub
git push origin main

echo "✅ Sauvegarde terminée !"