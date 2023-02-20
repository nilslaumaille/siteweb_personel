---
title: "Mettre à jour Portainer"
date: 2020-06-08T06:00:23+06:00
hero: images/teampass.jpg
description: Mettre à jour Portainer
menu:
  sidebar:
    name: Mise à jour de Portainer
    identifier: portainer_mise_a_jour
    parent: openmediavault
    weight: 500
---

> En cours d'écriture ...

Dès lors qu'une nouvelle version de Portainer est disponible, un bandeau l'indique dans la page de Portainer.

Pour le mettre à jour, j'ai un peu tourné en rond avant de trouver une solution extrémement simple.

À partir d'OpenMediaVault, il suffit de :
- Sélectionner l'option `OMV-Extras` présent dans la section `Système`
- Cliquer sur l'onglet `Docker`
- Depuis le menu du haut, choisir `Installer` dans la liste déroulante de `Portainer`
- Attendre que l'installation soit terminée
- Rafraichir la page de Portainer

Aussi étrange que cela puisse paraitre et bien que Portainer soit déjà installé, il suffit de le ré-installer pour que l'instance en place se mette à jour.

👍