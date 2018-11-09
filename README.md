# IHM_TP3_GROSDAILLON_BAMBA

Réalisé par Hugo GROS-DAILLON et Samuel BAMBA.

## Execution du programme

Lancer Webstorm

Lancer la commande "npm install" dans un terminal positionné à la racine du projet

Dans Webstorm, Clique droit sur package.json, puis sélectionner la commande “Show npm scripts”

Lancer 'server'

Lancer 'compile'

Ouvrir un navigateur en accéder à "http://localhost:8080" ou "http://@IP:8080" si vous avez partagé la connexion de votre smartphone

## Synchronisation mobile

Connecter le mobile à l'ordinateur

Activer le Hotspot du mobile

Inspecter la page web

Parameters > More Tools > Remote Devices

Se connecter sur l'adresse IP du PC avec le mobile

## Choix d'implémentation

Nous avons désactivé le zoom navigateur natif car il interférait avec notre rotozoom à deux doigts

En définissant une taille de base et une taille maximale

index.html

```
+ <meta charset="utf-8"
+			  name='viewport'
+			  content='width=device-width, initial-scale=0.3, maximum-scale=0.3, user-scalable=0'/>
```

## Actions

Drag: Déplacement d'une image ou vidéo avec un doigt

Rotation: Changer l'orientation d'une image ou une vidéo avec deux doigts

Zoom: Modifier la taillle d'une image ou vidéo en pinchant avec deux doigts
