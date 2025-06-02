using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.ValueObjects;

namespace CRMBackend.Infrastructure.Data.Seeders;

public class DodavatelSeeder : IDataSeeder
{
    public int Order => 1;

    public int NumberOfDodavatelia { get; set; } = 15;

    public async Task SeedAsync(ApplicationDbContext dbContext)
    {
        Console.WriteLine("Seeding initial Dodavatel...");

        var dodavatelia = Enumerable.Range(0, NumberOfDodavatelia)
            .Select(_ => CreateRandomDodavatel())
            .ToList();

        dbContext.Dodavatelia.AddRange(dodavatelia);
        await dbContext.SaveChangesAsync();
    }

    private Dodavatel CreateRandomDodavatel()
    {
        var random = new Random();
        var nazovFirmy = GenerateRandomCompanyName(random);
        var dodavatel = new Dodavatel
        {
            NazovFirmy = nazovFirmy,
            Email = GenerateEmailFromCompanyName(nazovFirmy),
            Telefon = GenerateRandomPhoneNumber(random)
        };

        dodavatel.SetAdresa(new Adresa
        {
            Ulica = GenerateRandomStreet(random),
            Mesto = GenerateRandomCity(random),
            PSC = random.Next(10000, 99999).ToString(),
            Krajina = "Slovensko"
        });

        dodavatel.SetPoznamka(GenerateRandomNote(random));

        return dodavatel;
    }

    private string GenerateRandomCompanyName(Random random)
    {
        var firstParts = new[] { "Delta", "Alpha", "Omega", "Gamma", "Sigma", "Nova", "Orion", "Zenith", "Apex", "Echo" };
        var secondParts = new[] { "Corp", "Group", "Global", "Enterprises", "Holdings", "Partners", "Industries", "Ventures", "Solutions", "International" };
        return $"{firstParts[random.Next(firstParts.Length)]} {secondParts[random.Next(secondParts.Length)]}";
    }

    private string GenerateEmailFromCompanyName(string companyName)
    {
        var cleanName = companyName.ToLower().Replace(" ", "");
        cleanName = new string(cleanName.Where(char.IsLetterOrDigit).ToArray());
        return $"info@{cleanName}.com";
    }

    private string GenerateRandomPhoneNumber(Random random)
    {
        return $"+4219{random.Next(10000000, 99999999)}";
    }

    private string GenerateRandomStreet(Random random)
    {
        var streets = new[] { "Hlavná", "Obchodná", "Priemyselná", "Dlhá", "Krátka", "Nová", "Staromestská", "Štúrova", "Mierová", "Slnečná" };
        return streets[random.Next(streets.Length)];
    }

    private string GenerateRandomCity(Random random)
    {
        var cities = new[] { "Bratislava", "Košice", "Žilina", "Prešov", "Nitra", "Banská Bystrica", "Trnava", "Martin", "Trenčín", "Poprad" };
        return cities[random.Next(cities.Length)];
    }

    private string? GenerateRandomNote(Random random)
    {
        var notes = new[] { "Dobrý dodávateľ", "Rýchla dodávka", "Kvalitné produkty", "Flexibilné podmienky", "Spoľahlivý partner", "Dlhodobá spolupráca", "Vynikajúci servis", "Konkurencieschopné ceny", "Široký sortiment", "Profesionálny prístup" };
        return notes[random.Next(notes.Length)];
    }
} 