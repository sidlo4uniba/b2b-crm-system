using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Infrastructure.Data.Seeders;

public class FirmaSeeder : IDataSeeder
{
    private static readonly Random _random = new();
    private static readonly List<string> _menNames = new() 
    { 
        "Peter", "Martin", "Milan", "Lukáš", "Jozef", "Tomáš", "Andrej", "Ján", "Michal", "Patrik", 
        "Adam", "Jakub", "Samuel", "Filip", "Matúš", "Dominik", "Oliver", "Richard", "Erik", "Daniel" 
    };
    private static readonly List<string> _womenNames = new() 
    { 
        "Jana", "Eva", "Zuzana", "Anna", "Katarína", "Martina", "Lucia", "Veronika", "Monika", "Alžbeta", 
        "Barbora", "Natália", "Kristína", "Michaela", "Sofia", "Viktória", "Laura", "Ema", "Nina", "Hana" 
    };
    private static readonly List<string> _menLastNames = new() 
    { 
        "Novák", "Horváth", "Varga", "Tóth", "Nagy", "Szabó", "Molnár", "Farkas", "Baláž", "Kováč", 
        "Kováčik", "Šimko", "Hudák", "Kollár", "Lukáč", "Mikula", "Polák", "Štefan", "Urban", "Veselý" 
    };
    private static readonly List<string> _womenLastNames = new() 
    { 
        "Nováková", "Horváthová", "Vargová", "Tóthová", "Nagyová", "Szabóová", "Molnárová", "Farkašová", "Balážová", "Kováčová", 
        "Kováčiková", "Šimková", "Hudáková", "Kollárová", "Lukáčová", "Mikulová", "Poláková", "Štefanová", "Urbanová", "Veselá" 
    };
    private static readonly List<string> _streets = new() 
    { 
        "Nová", "Hlavná", "Dlhá", "Krátka", "Široká", "Úzka", "Lesná", "Lúčna", "Horská", "Riečna", 
        "Záhradná", "Lipová", "Javorová", "Dubová", "Brezová", "Jasná", "Slnečná", "Hviezdna", "Veterná", "Mliečna" 
    };
    private static readonly List<string> _cities = new() 
    { 
        "Bratislava", "Košice", "Prešov", "Žilina", "Banská Bystrica", "Nitra", "Trnava", "Trenčín", "Poprad", "Piešťany", 
        "Martin", "Považská Bystrica", "Nové Zámky", "Michalovce", "Spišská Nová Ves", "Komárno", "Levice", "Humenné", "Bardejov", "Liptovský Mikuláš" 
    };
    
    private static readonly List<string> _firstWords = new()
    {
        "Invest", "Medika", "Green", "Brick", "Tech", "Moda", "Elektro", "Sport", "Kozmetik", "Zdravie",
        "Knihy", "Obuv", "Tašky", "Doplnky", "Kancel", "Agro", "Gastro", "Pharma", "Build", "Stavby",
        "Auto", "Metal", "Wood", "Drevo", "Textil", "Print", "Tlač", "Paper", "Papier", "Chem",
        "Energy", "Fin", "Market", "Media", "Travel", "Logic", "Bio", "Eco", "Aqua", "Voda",
        "Terra", "Zem", "Clean", "Secure", "Home", "Domov", "Garden", "Záhrada", "Art", "Umenie",
        "Music", "Hudba", "Food", "Jedlo", "Drinks", "Nápoje", "Craft", "Remeslo", "Strojár", "Farm",
        "Global", "Central", "United", "Euro", "Inter", "Slovak", "Danubia", "Dunaj", "Carpathia", "Karpaty",
        "Tatra", "Tatry", "Váh", "Nitra", "Pressburg", "Bratislava", "Cassovia", "Košice", "Liptov", "Orava",
        "Zemplín", "Šariš", "Hron", "Ipeľ", "Slaná", "Myjava", "Záhorie", "Považie", "Spiš", "Gemer",
        "Nord", "Sever", "Süd", "Juh", "West", "Západ", "Ost", "Východ", "Slnko", "Les",
        "Dub", "Buk", "Javor", "Kryštál", "Jantár", "Delta", "Omega", "Alfa", "Beta",
        "Sigma", "Atlas", "Orion", "Patriot", "Pioneer", "Mercur", "Vulkán", "Maják", "Kompas", "Sila",
        "Rozvoj", "Úspech", "Rast", "Budúcnosť", "Tradícia", "Kvalita", "Presnosť", "Istota", "Partner", "Obchod",
        "Dodávky", "Spojenie", "Zdroj", "Centrum", "Bod", "Most", "Cesta", "Prístav"
    };

    private static readonly List<string> _secondWords = new()
    {
        "Solutions", "Riešenia", "Distribúcia", "Pro", "Ventures", "Trend", "Plus", "Expert", "Svet", "Max",
        "Top", "Lux", "Profi", "Kvalita", "Group", "Skupina", "Partners", "Logistics", "Logistika", "Trading",
        "Obchodovanie", "Services", "Služby", "Holding", "Systems", "Systémy", "Network", "Sieť", "Company", "Spoločnosť",
        "Corp", "Agency", "Agentúra", "Direct", "Priamo", "Imports", "Dovoz", "Exports", "Vývoz", "Supply",
        "Dodávky", "Commerce", "Industries", "Priemysel", "Associates", "Enterprise", "Podnik", "Works", "Závody", "Factory",
        "Továreň", "House", "Dom", "Point", "Bod", "Hub", "Zone", "Platform", "Studio", "Štúdio",
        "Lab", "Laboratórium", "Center", "Centrum", "Union", "Únia", "Management", "Consulting", "Development", "Rozvoj",
        "Technology", "Technológie", "Digital", "Online", "Predaj", "Výroba", "Sklad", "Dielňa", "Montáže", "Real",
        "Prime", "Core", "Global", "National", "Národný", "Regional", "Regionálny", "Premium", "Select", "Výber",
        "Value", "Hodnota", "Smart", "Advanced", "Pokročilé", "Secure", "Zabezpečenie", "Dynamic", "Dynamika", "Efficient",
        "Efektívne", "Reliable", "Spoľahlivosť", "Certified", "Certifikované", "Standard", "Basic", "Základ", "NextGen", "Nová Generácia",
        "Unlimited", "Neobmedzené", "Complete", "Kompletné", "Integrated", "Integrované", "Custom", "Na Mieru", "Pure", "Čisté",
        "Fresh", "Čerstvé", "Natural", "Prírodné", "Organic", "Bio", "Sustainable", "Udržateľné", "SK", "EU",
        "Intl", "Stred", "Západ", "Východ", "Sever", "Juh", "PreVás", "PreVšetkých", "4U", "ForBusiness",
        "PreFirmy", "ForHome", "PreDomácnosť", "Link", "Spojenie", "Zdroj", "Way", "Cesta", "Line", "Grid",
        "Flow", "Bridge", "Most", "Access", "Prístup", "Vision", "Vízia", "Future", "Budúcnosť"
    };

    private static readonly Dictionary<char, char> _slovakCharMap = new()
    {
        {'á', 'a'}, {'ä', 'a'},
        {'č', 'c'},
        {'ď', 'd'},
        {'é', 'e'},
        {'í', 'i'},
        {'ĺ', 'l'}, {'ľ', 'l'},
        {'ň', 'n'},
        {'ó', 'o'}, {'ô', 'o'},
        {'ŕ', 'r'},
        {'š', 's'},
        {'ť', 't'},
        {'ú', 'u'},
        {'ý', 'y'},
        {'ž', 'z'},
        {'Á', 'a'}, {'Ä', 'a'},
        {'Č', 'c'},
        {'Ď', 'd'},
        {'É', 'e'},
        {'Í', 'i'},
        {'Ĺ', 'l'}, {'Ľ', 'l'},
        {'Ň', 'n'},
        {'Ó', 'o'}, {'Ô', 'o'},
        {'Ŕ', 'r'},
        {'Š', 's'},
        {'Ť', 't'},
        {'Ú', 'u'},
        {'Ý', 'y'},
        {'Ž', 'z'}
    };

    private readonly ApplicationDbContext _dbContext;

    public FirmaSeeder(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public int Order => 2;

    public int NumberOfFirmy { get; set; } = 100; 

    public async Task SeedAsync(ApplicationDbContext dbContext)
    {
        Console.WriteLine("Seeding initial Firma...");

        int totalCombinations = _firstWords.Count * _secondWords.Count;

        if (totalCombinations < NumberOfFirmy)
        {
            throw new InvalidOperationException($"Not enough unique combinations of _firstWords and _secondWords to generate {NumberOfFirmy} unique Nazov values. Total combinations: {totalCombinations}");
        }

        var firmy = new List<Firma>();
        for (int i = 0; i < NumberOfFirmy; i++)
        {
            firmy.Add(CreateFirma());
        }

        _dbContext.Firmy.AddRange(firmy);
        await _dbContext.SaveChangesAsync();
    }

    private Firma CreateFirma()
    {
        var companyName = $"{_firstWords[_random.Next(_firstWords.Count)]} {_secondWords[_random.Next(_secondWords.Count)]}";
        var nazov = $"{companyName} {RandomCompanyType()}";

        while (_dbContext.Firmy.Any(f => f.Nazov == nazov))
        {
            companyName = $"{_firstWords[_random.Next(_firstWords.Count)]} {_secondWords[_random.Next(_secondWords.Count)]}";
            nazov = $"{companyName} {RandomCompanyType()}";
        }

        var firma = new Firma
        {
            Nazov = nazov,
            ICO = RandomICO(),
            Adresa = new Adresa
            {
                Ulica = $"{_streets[_random.Next(_streets.Count)]} {_random.Next(1, 100)}",
                Mesto = _cities[_random.Next(_cities.Count)],
                PSC = $"{_random.Next(80000, 99999)}",
                Krajina = "Slovensko"
            }
        };

        firma.SetIcDph(_random.Next(2) == 0 ? $"SK{_random.Next(200000000, 299999999)}" : null);
        firma.UpdateSkoreSpolahlivosti((decimal)_random.NextDouble());
        firma.UpdateHodnotaObjednavok((decimal)_random.Next(1000, 1000000));

        AddKontaktneOsoby(firma, companyName.ToLower());

        return firma;
    }

    private string NormalizeSlovakChars(string input)
    {
        return new string(input.Select(c => _slovakCharMap.ContainsKey(c) ? _slovakCharMap[c] : c).ToArray());
    }

    private void AddKontaktneOsoby(Firma firma, string companyName)
    {
        var count = _random.Next(1, 4);
        for (int i = 0; i < count; i++)
        {
            var isMale = _random.Next(2) == 0;
            var firstName = isMale ? _menNames[_random.Next(_menNames.Count)] : _womenNames[_random.Next(_womenNames.Count)];
            var lastName = isMale ? _menLastNames[_random.Next(_menLastNames.Count)] : _womenLastNames[_random.Next(_womenLastNames.Count)];

            while (firma.KontaktneOsoby.Any(o => o.Meno == firstName && o.Priezvisko == lastName))
            {
                firstName = isMale ? _menNames[_random.Next(_menNames.Count)] : _womenNames[_random.Next(_womenNames.Count)];
                lastName = isMale ? _menLastNames[_random.Next(_menLastNames.Count)] : _womenLastNames[_random.Next(_womenLastNames.Count)];
            }

            var normalizedFirstName = NormalizeSlovakChars(firstName.ToLower());
            var normalizedLastName = NormalizeSlovakChars(lastName.ToLower());
            var normalizedCompanyName = NormalizeSlovakChars(companyName.Replace(" ", ""));

            var email = $"{normalizedFirstName}.{normalizedLastName}@{normalizedCompanyName}.com";

            var osoba = new KontaktnaOsoba
            {
                Meno = firstName,
                Priezvisko = lastName,
                Email = email,
                Telefon = $"+4219{_random.Next(10000000, 99999999)}"
            };
            firma.AddKontaktnaOsoba(osoba);
        }
    }
    private string RandomCompanyType() => _random.Next(6) < 5 ? "s.r.o." : "a.s.";
    private string RandomICO() => _random.Next(10000000, 99999999).ToString();
} 
