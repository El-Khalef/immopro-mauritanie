#!/bin/bash
# Script simple pour pousser vers GitHub avec authentification

echo "🚀 Envoi vers GitHub..."

# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "ImmoPro Mauritanie - $(date '+%Y-%m-%d %H:%M:%S')"

# Pousser avec authentification directe
echo "Envoi des fichiers vers GitHub..."
git push https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/El-khalef/immopro-mauritanie.git main

echo "✅ Projet sauvegardé sur GitHub !"