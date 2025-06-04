# B2B CRM Systém pre E-shop s Reklamnými Produktmi

Tento projekt predstavuje B2B CRM systém navrhnutý špeciálne pre potreby e-shopu predávajúceho reklamné produkty. Cieľom bolo vytvoriť riešenie, ktoré adresuje špecifické procesy a životný cyklus objednávok firemných zákazníkov, ktoré často nie sú plne pokryté generickými CRM systémami. Aplikácia je vyvinutá s dôrazom na moderné softvérové prístupy, robustnú architektúru a intuitívne používateľské rozhranie.

## Kľúčové Funkcionality

*   **Správa Zákazníkov (B2B):** Evidencia firiem a ich kontaktných osôb.
*   **Správa Objednávok:** Sledovanie životného cyklu objednávok (od nacenenia po vybavenie).
*   **Generovanie PDF Objednávok:** Automatizované vytváranie PDF dokumentov pre objednávky.
*   **Integrácia s Keycloak:** Bezpečná autentifikácia a autorizácia používateľov.
*   **Prispôsobené UI:** Používateľské rozhranie navrhnuté pre špecifické potreby e-shopu.

## Technologický Stack

*   **Backend:**
    *   ASP.NET Core (.NET 8 / .NET 9) - Web API
    *   C#
    *   Entity Framework Core - ORM pre prístup k databáze
    *   MediatR - Implementácia CQRS patternu (Commands, Queries, Behaviors)
*   **Frontend:**
    *   Angular (TypeScript)
    *   Angular Material - Knižnica UI komponentov
    *   RxJS - Reaktívne programovanie
*   **Databáza:**
    *   PostgreSQL
*   **Autentifikácia & Autorizácia:**
    *   Keycloak
*   **Kontajnerizácia (Vývojové Prostredie):**
    *   Docker & Docker Compose
*   **Architektonické Princípy:**
    *   Clean Architecture
    *   Domain-Driven Design (DDD)

## Architektúra Systému

Aplikácia je postavená na princípoch **Clean Architecture**, ktorá zabezpečuje oddelenie zodpovedností a vysokú mieru testovateľnosti a udržateľnosti. Závislosti smerujú dovnútra, pričom vnútorné vrstvy definujú abstrakcie (rozhrania) implementované vonkajšími vrstvami.

Hlavné vrstvy (projekty v rámci .NET solution):

1.  **`Domain`**: Jadro aplikácie obsahujúce čistú biznis logiku. Uplatňujú sa tu princípy **Domain-Driven Design (DDD)**:
    *   **Aggregates** (napr. `Objednavka`): Zodpovedné za konzistenciu dát. Zmeny stavu sú riadené metódami agregátu.
    *   **Entities & Value Objects**: Stavebné bloky doménového modelu.
    *   **Domain Events**: Komunikácia zmien stavu medzi časťami domény.
    *   Použitie `IAggregateRoot` ako marker interfejsu.
    *   Zapuzdrenie stavu (napr. `private set;` pre vlastnosti, modifikácia cez metódy).
2.  **`Application`**: Orchestruje operácie, obsahuje aplikačnú logiku.
    *   Využíva knižnicu **MediatR** pre spracovanie príkazov (Commands) a dopytov (Queries).
    *   **MediatR Behaviors** sa používajú pre prierezové záležitosti (napr. validácia vstupov).
3.  **`Infrastructure`**: Implementácia závislostí na externých systémoch.
    *   Konfigurácia **Entity Framework Core** (DbContext, migrácie, definície tabuliek).
    *   Integrácie s externými službami (napr. generovanie PDF, komunikácia s Keycloak).
4.  **`Web` (API)**: Sprístupňuje funkcionalitu systému prostredníctvom RESTful HTTP rozhrania.
    *   Obsahuje ASP.NET Core controllers, ktoré delegujú požiadavky na aplikačnú vrstvu.

Frontendová aplikácia je vyvinutá v **Angular** a komunikuje s backendom prostredníctvom Web API.

## Štruktúra Projektu

```
.
├── docker/bakalarka-dev/         # Docker Compose konfigurácia pre vývojové prostredie
│   ├── docker-compose.yml
│   └── keycloak-config/
│       └── realm-export.json     # Predpripravená Keycloak realm konfigurácia
├── frontend/                     # Angular frontend aplikácia
│   ├── src/
│   │   ├── app/
│   │   │   ├── firmy/            # Príklad modulu/komponenty
│   │   │   │   └── ...
│   │   │   ├── shared/
│   │   │   │   └── services/
│   │   │   │       └── http-clients/ # HTTP klienti pre komunikáciu s API
│   │   │   └── ...
│   │   └── ...
│   ├── angular.json
│   └── package.json
└── src/                          # .NET Backend solution
    ├── Application/
    ├── Domain/
    ├── Infrastructure/
    ├── Web/                      # ASP.NET Core Web API (štartovací projekt)
    └── B2BCrmSystem.sln
```

## Požiadavky na Prostredie

*   .NET SDK (odporúčaná verzia .NET 8 alebo .NET 9)
*   Node.js (LTS verzia) a npm
*   Angular CLI (`npm install -g @angular/cli`)
*   Docker Desktop (s Docker Compose)

## Lokálne Vývojové Prostredie - Nastavenie a Spustenie

1.  **Klonovanie Repozitára:**
    ```bash
    git clone <URL_REPOZITARA>
    cd <NAZOV_REPOZITARA>
    ```

2.  **Spustenie Infraštruktúry (Databáza & Keycloak):**
    Všetky infraštruktúrne služby (PostgreSQL, Keycloak) sú spravované cez Docker Compose.
    *   Prejdite do adresára `docker/bakalarka-dev/`:
        ```bash
        cd docker/bakalarka-dev/
        ```
    *   **Prvé spustenie Keycloak s importom realmu:**
        V súbore `docker-compose.yml` pre službu `keycloak`:
        *   Odkomentujte riadok: `command: start-dev --import-realm`
        *   Zakomentujte riadok: `command: start-dev`
        Tento krok je potrebný **iba pri prvom spustení** na naimportovanie `realm-export.json`.
    *   Spustite kontajnery:
        ```bash
        docker compose up -d
        ```
    *   **Po úspešnom prvom spustení a importe realmu:** Vráťte zmeny v `docker-compose.yml` späť (zakomentujte `--import-realm` a odkomentujte štandardný `start-dev` príkaz), aby pri ďalších spusteniach nedochádzalo k pokusu o re-import.
    *   **Konfigurácia Keycloak používateľov:**
        *   Otvorte administračnú konzolu Keycloak (typicky `http://localhost:8080`).
        *   Prihláste sa (predvolené credentials sú v `docker-compose.yml` pre službu Keycloak, ak nie sú zmenené).
        *   Manuálne pridajte používateľov (zamestnancov) v rámci importovaného realmu, nastavte im heslá a priraďte aplikačné roly (napr. `admin`, `obchodnik`).

3.  **Backend Aplikácia (.NET):**
    *   **Aplikovanie EF Core Migrácií:**
        Z koreňového adresára projektu spustite:
        ```bash
        dotnet ef database update --project src/Infrastructure/Infrastructure.csproj --startup-project src/Web/Web.csproj
        ```
        Tento príkaz vytvorí databázovú schému v PostgreSQL kontajneri.
    *   **Spustenie Backendu:**
        Prejdite do adresára Web API projektu:
        ```bash
        cd src/Web/
        dotnet watch run
        ```
        Backend bude dostupný na `https://localhost:5001` a `http://localhost:5000` (alebo portoch definovaných v `launchSettings.json`).
        Pri prvom spustení v `Development` prostredí sa automaticky vykoná **DB seeding** (naplnenie databázy testovacími dátami), ak je databáza prázdna.

4.  **Frontend Aplikácia (Angular):**
    *   Prejdite do adresára frontend projektu:
        ```bash
        cd frontend/
        ```
    *   Inštalácia závislostí (ak ste tak ešte neurobili):
        ```bash
        npm install
        ```
    *   Spustenie vývojového servera:
        ```bash
        npm start
        ```
        Frontend bude dostupný na `http://localhost:4200/`. Aplikácia sa automaticky prekompiluje pri zmene zdrojových súborov.
