---
title: "Comment mettre à jour automatiquement vos logiciels sous Windows 11"
date: 2023-03-26T23:00:00Z
hero: images/winget_install.png
description: Comment mettre à jour automatiquement vos logiciels sous Windows 11
tags: ["Windows 11","Winget","Script"]
categories: ["Basic"]
menu:
  sidebar:
    name: Winget
    identifier: win11-winget-mise-a-jour-automatique
    parent: informatique
    weight: 500
---

> Mon cas d'usage, pouvoir mettre à jour automatiquement les différents logiciels installés

# Winget ?

Winget est l'outil en ligne de commande du gestionnaire de packages de Windows (10 et 11). L'avantage étant que l'on peut donc l'utiliser dans des scripts maisons pour définir notre propre stratégie de mise à jour des logiciels.

Toute la [documentation de Winget](https://learn.microsoft.com/fr-fr/windows/package-manager/winget/) est disponible.

À savoir pour la suite que Winget présente les applications de la façon suivante.

    Nom                                      ID                                        Version            Disponible Source
    -----------------------------------------------------------------------------------------------------------------------
    TortoiseGit                              0BF99681-825C-4B2A-A14F-2AC01DB9B70E_n6n… 1.0.0.0
    7-Zip 22.01 (x64)                        7zip.7zip                                 22.01                         winget
    AnyConnect                               CiscoSystems.AnyConnect_edjcgkw48dhxt     5.0.907.0
    Everything 1.4.1.1022 (x64)              voidtools.Everything                      1.4.1.1022                    winget
    FileZilla 3.63.2                         FileZilla Client                          3.63.2
    Foxit PDF Reader                         Foxit.FoxitReader                         12.1.1.15289                  winget
    Git                                      Git.Git                                   2.40.0                        winget
    GNU Privacy Guard                        GnuPG.GnuPG                               2.4.0                         winget
    Gpg4win (4.1.0)                          GnuPG.Gpg4win                             4.1.0                         winget
    Greenshot 1.2.10.6                       Greenshot.Greenshot                       1.2.10.6                      winget

# Concrétement


## Le script

Comme il s'agit d'un outil en ligne de commande, il est nécessaire de réaliser un script. C'est ce dernier que l'on appellera via le gestionnaire de tâches de Windows.

Le script ci-dessous permet de définir :
* des applications à ignorer,
* un fichier « Log » qui permettra d'historiser les différentes actions.

À noter que je me suis totalement appuyé sur des scripts existants :
* [How to create a list of non upgradable software for winget](https://www.codewrecks.com/post/general/winget-update-selective/)
* [Winget app Updater Exclusion Script](https://malwaretips.com/threads/winget-app-updater-exclusion-script.112743/)
* [Gist alkampfergit/WingetUpgrade.ps1](https://gist.github.com/alkampfergit/2f662c07df0ca379c8e8e65e588c687b)

Enfin, ce script a été adapté pour fonctionner avec un environnement Windows en français et j'ai déplacé les éléments de paramétrage au début du fichier pour plus de facilité.

Voici le script dans son intégralité à copier dans un fichier que vous nommerez par exemple `script_maj_logiciels.ps1`.

    # A ADAPTER
    $toSkip = @(
    'Mobatek.MobaXterm')
    $LogFile = "Winget.log.txt"
    $Dir = "C:\Personnel\outils\scripts\" # attention au dernier \

    #-----------------------------------

    class Software {
        [string]$Name
        [string]$Id
        [string]$Version
        [string]$AvailableVersion
    }

    # LOG
    IF(!(Test-Path $Dir)){mkdir $Dir}
    $PathLogFile = $Dir + "" + $LogFile

    Function LogEvent([string]$strLOGStatus, [string]$strLogMessage)
    {
    	$GD = get-Date
    	"$GD-$strLOGStatus-$strLogMessage" | out-file $PathLogFile -append
    	switch($strLOGStatus)
    	{
    		"LOGInfo" {Write-Host $strLogMessage -ForegroundColor "green"}
    		"LOGError" {Write-Host $strLogMessage -ForegroundColor "red"}
    		"LOGWarning" {Write-Host $strLogMessage -ForegroundColor "Yellow"}
    	}
    }

    LogEvent "LOGInfo" ("--------------------------------------------------")
    LogEvent "LOGInfo" ("--------- Starting Winget Upgrade Script - gathering DATA")

    $upgradeResult = winget upgrade --include-unknown | Out-String

    $lines = $upgradeResult.Split([Environment]::NewLine)


    # Find the line that starts with Name, it contains the header
    $fl = 0
    while (-not $lines[$fl].StartsWith("Nom"))
    {
        $fl++
    }

    # Line $i has the header, we can find char where we find ID and Version
    $idStart = $lines[$fl].IndexOf("ID")
    $versionStart = $lines[$fl].IndexOf("Version")
    $availableStart = $lines[$fl].IndexOf("Disponible")
    $sourceStart = $lines[$fl].IndexOf("Source")

    # Now cycle in real package and split accordingly
    $upgradeList = @()
    For ($i = $fl + 1; $i -le $lines.Length; $i++)
    {
        $line = $lines[$i]
        if ($line.Length -gt ($availableStart + 1) -and -not $line.StartsWith('-'))
        {
            $name = $line.Substring(0, $idStart).TrimEnd()
            $id = $line.Substring($idStart, $versionStart - $idStart).TrimEnd()
            $version = $line.Substring($versionStart, $availableStart - $versionStart).TrimEnd()
            $available = $line.Substring($availableStart, $sourceStart - $availableStart).TrimEnd()
            $software = [Software]::new()
            $software.Name = $name;
            $software.Id = $id;
            $software.Version = $version
            $software.AvailableVersion = $available;

            $upgradeList += $software
        }
    }

    LogEvent "LOGInfo" ("Winget Upgrade List: ")

    $upgradeList | Format-Table

    foreach ($package in $upgradeList)
    {
        if (-not ($toSkip -contains $package.Id))
        {
            #Write-Host "Going to upgrade package $($package.id)"
    		LogEvent "LOGInfo" ("--------- Going to upgrade package $($package.id)")
            & winget upgrade --include-unknown $package.id
        }
        else
        {    
    		LogEvent "LOGInfo" ("Skipped upgrade to package $($package.id)")
            #Write-Host "Skipped upgrade to package $($package.id)"
        }
    }

## À adapter

Le script doit être adapté pour correspondre à votre besoin.

### Exclure des applications de la mise à jour automatique

Dans certains cas, cela peut être pratique de conserver la maitrise des mises à jour de certaines applications.
Pour cela, on utilise le tableau `$toSkip` qui se rempli en considérant l'ID de l'application et pas son nom.

    $toSkip = @(
    'Microsoft.Teams',
    'Notepad++.Notepad++')

Il est possible de laisser le tableau vide. Dans ce cas, aucune exclusion ne sera faite lors de la mise à jour.

### Historiser les événements

Comme le script s'exécutera de façon automatique, le fichier log permet de suivre l'exécution du script.
Pour cela, il suffit de renseigner ces 2 variables.

La 1ère contient le nom du fichier log.
La 2de contient le chemin vers ce fichier.

    $LogFile = "Winget.log.txt"
    $Dir = "C:\Personnel\outils\scripts\" # attention au dernier \

# Programmer l'exécution de la mise à jour
