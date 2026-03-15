# Dofus Team Creator

**Outil communautaire de création et d'évaluation d'équipes pour Dofus — notes des classes par la communauté, tier list, suggestions automatiques et classement des compositions.**

---

## C'est quoi ?

**Dofus Team Creator** est un outil fait pour les joueurs de Dofus qui veulent construire, analyser et comparer des compositions d'équipes de 4 personnages.

L'idée de base : chaque équipe est formée de 4 rôles complémentaires. Selon la classe que tu mets dans chaque rôle, l'équipe sera plus ou moins performante. Le site t'aide à trouver la meilleure combinaison possible — et la communauté peut voter pour affiner les recommandations.

---

## Les 4 rôles d'une équipe

| Rôle | Description |
|---|---|
| **Tank** | Absorbe les dégâts, protège l'équipe |
| **Soutien polyvalent** | Soins, boucliers, retrait PM, mobilité — le couteau suisse |
| **DPT** | Damage dealer principal, focus dégâts bruts |
| **Hybride / DPT2** | Damage dealer secondaire avec une touche support |

Une bonne équipe couvre les 4 rôles efficacement et présente idéalement une cohérence dans sa portée (distance, mi-distance ou corps-à-corps).

---

## Les 20 classes disponibles

Cra · Ecaflip · Eniripsa · Enutrof · Féca · Iop · Osamodas · Pandawa · Sacrieur · Sadida · Sram · Xélor · Roublard · Zobal · Steamer · Eliotrope · Huppermage · Ouginak · Forgelance

---

## Les 12 statistiques d'une classe

Chaque classe est évaluée sur 12 stats, notées de 0 à 5 étoiles (avec demi-étoile) :

| Icône | Stat | Ce qu'elle mesure |
|---|---|---|
| 💥 | Dégâts zone | Efficacité en AoE (toucher plusieurs ennemis) |
| 🎯 | Dégâts monocible | Puissance sur une cible unique |
| 🚫 | Retrait PM | Capacité à retirer des points de mouvement aux ennemis |
| 🛡️ | Shield | Pose de boucliers |
| ⬇️ | Armure | Réduction des dégâts reçus par l'équipe |
| 🩸 | Vol de vie | Récupération de PV via les dégâts |
| 💚 | Soins | Capacité à soigner les alliés |
| ⚡ | Mobilité | Déplacements et repositionnement |
| 🏹 | Dégâts distance | Efficacité en combat à longue portée |
| ⚔️ | Dégâts mi-distance | Efficacité en combat à mi-portée |
| 🗡️ | Dégâts CAC | Efficacité en combat corps-à-corps |
| 🏋️ | Tank | Résistance et capacité à encaisser |

---

## Comment fonctionne la notation

### Score automatique

Quand tu construis une équipe, chaque rôle reçoit un **score automatique** calculé à partir des stats de la classe choisie :
- Le **Tank** est évalué principalement sur sa stat Tank
- Le **Soutien** est évalué sur la meilleure de ses stats de soutien (soins, shield, armure, retrait PM, mobilité)
- Le **DPT** est évalué sur ses dégâts AoE ou monocibles (le meilleur des deux)
- L'**Hybride** combine les deux approches

> **Bonus Cra** : si un Cra est dans l'équipe et que tous les alliés ont une stat distance ≥ 5, le profil distance de l'équipe est boosté.

### Score communautaire

Les joueurs peuvent **noter chaque équipe de 1 à 5 étoiles**. La moyenne des votes forme la note communautaire.

### Score final (mixte)

```
Score final = Score auto × 30% + Note communautaire × 70%
```

La communauté a donc le dernier mot. Si personne n'a encore voté, seul le score automatique est utilisé.

### Tiers

| Tier | Score | Signification |
|---|---|---|
| **S** | ≥ 9/10 | Légendaire |
| **A** | ≥ 7/10 | Très bon |
| **B** | ≥ 5/10 | Correct |
| **C** | < 5/10 | À améliorer |

---

## Fonctionnalités

### Créateur d'équipe
Compose ton équipe en sélectionnant une classe pour chacun des 4 rôles. Le score s'affiche en temps réel avec le détail par rôle et le profil de portée de l'équipe. Tu peux nommer ton équipe, choisir la version du patch, ajouter une description, des points forts et des points faibles, puis la sauvegarder.

### Tier List
Parcours les compositions **recommandées**, classées par tier (S/A/B/C). Chaque fiche montre les 4 classes de l'équipe avec leurs rôles, la note communautaire et le tier associé. Tu peux noter une équipe directement depuis cette page.

### Classement
Tableau de toutes les équipes sauvegardées, triables par nom, score automatique, note communautaire, score final ou version de patch. Un clic sur une équipe ouvre sa fiche détaillée où tu peux la noter.

### Classes
Vue sur l'ensemble des classes du jeu. Clique sur n'importe quelle classe pour :
- Voir ses stats actuelles (moyenne communautaire ou stats officielles si aucun vote)
- **Voter** en attribuant des étoiles (avec demi-étoile) à chacune des 12 stats selon ta perception de la classe
- Voir en temps réel comment tes notes influencent le rôle optimal calculé pour cette classe
- Consulter l'aperçu de performance par rôle (Tank, Soutien, DPT, Hybride)

> Chaque visiteur peut voter **une seule fois par classe**. La moyenne de tous les votes affine les recommandations de rôle pour toute la communauté.

### Suggestions
Le site génère automatiquement des compositions d'équipes optimisées à partir des stats des classes. Chaque suggestion est scorée et tiérisée. Tu peux sauvegarder n'importe quelle suggestion en un clic.

---

## Patches supportés

3.5 · 3.4 · 3.3 · 3.2 · 3.1 · 3.0

---

## Contribuer

Tu peux contribuer au projet en :
- **Votant** sur les classes et les équipes depuis le site
- **Soumettant** ta propre composition d'équipe via le Créateur
- **Signalant** des bugs ou suggestions via les [Issues GitHub](../../issues)