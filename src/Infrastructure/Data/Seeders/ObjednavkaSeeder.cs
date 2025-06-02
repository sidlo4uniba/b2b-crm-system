using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRMBackend.Infrastructure.Data.Seeders;

public class ObjednavkaSeeder : IDataSeeder
{
    public int Order => 4; 

    private readonly Random _random = new();

    public async Task SeedAsync(ApplicationDbContext dbContext)
    {
        Console.WriteLine("Seeding initial Objednavka...");
        
        if (!dbContext.Firmy.Any() || !dbContext.Tovary.Any())  
        {
            Console.WriteLine("Skipping Objednavka seeding as Firma or Tovar data is missing.");
            return;
        }

        var firmy = await dbContext.Firmy.Include(f => f.KontaktneOsoby).ToListAsync();
        var tovary = await dbContext.Tovary.Include(t => t.Varianty).ToListAsync();

        
        var orderCreationTasks = new List<Func<ApplicationDbContext, Firma, List<Tovar>, Task>>
        {
            CreateStandardObjednavka,
            CreateStandardObjednavka,
            CreateStandardObjednavka,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateObjednavkaPoNaceneni,
            CreateZrusenaObjednavka,
            CreateObjednavkaSChybouKlienta,
            CreateZrusenaVyrobaNemozna,
            CreateZrusenaNezaplatenaNaCas,
            CreateZrusenaPriVyrobe,
            CreateZrusenaKomunikacia
        };

        
        foreach (var firma in firmy)
        {
            if (!firma.KontaktneOsoby.Any()) continue;

            
            int numOrdersToCreate = _random.Next(0, 6); 

            for (int i = 0; i < numOrdersToCreate; i++)
            {
                
                int methodIndex = _random.Next(orderCreationTasks.Count);
                var createOrderTask = orderCreationTasks[methodIndex];
                
                
                await createOrderTask(dbContext, firma, tovary);
            }
        }
    }
    
    private async Task CreateStandardObjednavka(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(firma.KontaktneOsoby.Count()));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Štandardná objednávka");
        objednavka.SetOcakavanyDatumDorucenia(DateTime.UtcNow.AddDays(_random.Next(10, 30)));
        objednavka.NaplanovanyDatumVyroby = DateTime.UtcNow.AddDays(_random.Next(5, 15));

        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        
        await dbContext.SaveChangesAsync();
    }

    private async Task CreateZrusenaObjednavka(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        int kontaktnaOsobaCount = firma.KontaktneOsoby.Count();
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(kontaktnaOsobaCount));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Zrušená objednávka");
        SetPastDates(objednavka);

        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        
        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        
        objednavka.SetFaza(ObjednavkaFaza.Nacenenie);
        objednavka.Zrusene = true;
        
        await dbContext.SaveChangesAsync();
    }
    
    private async Task CreateObjednavkaSChybouKlienta(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        int kontaktnaOsobaCount = firma.KontaktneOsoby.Count();
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(kontaktnaOsobaCount));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Objednávka s chybou klienta");
        SetPastDates(objednavka);
        
        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        
        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        
        objednavka.SetChybaKlienta(GetRandomChybaKlienta());
        
        await dbContext.SaveChangesAsync();
    }

    private async Task CreateObjednavkaPoNaceneni(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        int kontaktnaOsobaCount = firma.KontaktneOsoby.Count();
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(kontaktnaOsobaCount));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Objednávka v spracovaní");
        SetPastDates(objednavka);

        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        
        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        
        objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        await dbContext.SaveChangesAsync();
        
        
        objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
        await dbContext.SaveChangesAsync();
        
        
        var possibleFinalPhases = new List<ObjednavkaFaza>
        {
            ObjednavkaFaza.Vybavene,
            ObjednavkaFaza.Vybavene,
            ObjednavkaFaza.Vybavene,
            ObjednavkaFaza.Vybavene,
            ObjednavkaFaza.Vybavene,
            ObjednavkaFaza.Vybavene,
            ObjednavkaFaza.Vybavene,
            ObjednavkaFaza.VyrobaNeriesene,
            ObjednavkaFaza.VyrobaNemozna,
            ObjednavkaFaza.VyrobaCaka,
            ObjednavkaFaza.OdoslanieCaka,
            ObjednavkaFaza.PlatbaCaka
        };
        
        var targetPhase = possibleFinalPhases[_random.Next(possibleFinalPhases.Count)];
        
        
        if (targetPhase == ObjednavkaFaza.Vybavene)
        {
            SetPastDates(objednavka);
        }
        else
        {
            objednavka.SetOcakavanyDatumDorucenia(DateTime.UtcNow.AddDays(_random.Next(5, 30)));
            objednavka.NaplanovanyDatumVyroby = DateTime.UtcNow.AddDays(_random.Next(2, 15));
        }

        await dbContext.SaveChangesAsync();
        
        
        switch (targetPhase)
        {
            case ObjednavkaFaza.VyrobaNemozna:
                objednavka.SetFaza(ObjednavkaFaza.VyrobaNemozna);
                
                objednavka.SetPoznamka("Výroba nie je možná - materiálové obmedzenia");
                break;
            
            case ObjednavkaFaza.VyrobaCaka:
                objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                objednavka.SetPoznamka("Čaká sa na výrobu");
                break;
            
            case ObjednavkaFaza.OdoslanieCaka:
                
                objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
                objednavka.SetPoznamka("Výroba dokončená, čaká sa na odoslanie");
                break;
            
            case ObjednavkaFaza.PlatbaCaka:
                
                objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.PlatbaCaka);
                objednavka.SetPoznamka("Tovar odoslaný, čaká sa na platbu");
                break;
            
            case ObjednavkaFaza.Vybavene:
                
                if (_random.Next(2) == 0)
                {
                    
                    objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                    await dbContext.SaveChangesAsync();
                    objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
                    await dbContext.SaveChangesAsync();
                    objednavka.SetFaza(ObjednavkaFaza.Vybavene);
                    objednavka.SetPoznamka("Objednávka vybavená - platba pri dodaní");
                }
                else
                {
                    
                    objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                    await dbContext.SaveChangesAsync();
                    objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
                    await dbContext.SaveChangesAsync();
                    objednavka.SetFaza(ObjednavkaFaza.PlatbaCaka);
                    await dbContext.SaveChangesAsync();
                    objednavka.Zaplatene = true; 
                    objednavka.SetPoznamka("Objednávka vybavená - už zaplatená");
                }
                break;
            
            
            default:
                objednavka.SetPoznamka("Výroba zatiaľ nezačala");
                break;
        }
        
        await dbContext.SaveChangesAsync();
    }
    
    
    
    
    private async Task CreateZrusenaVyrobaNemozna(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        int kontaktnaOsobaCount = firma.KontaktneOsoby.Count();
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(kontaktnaOsobaCount));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Výroba nie je možná - technické obmedzenia");
        SetPastDates(objednavka);

        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        
        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        
        objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        await dbContext.SaveChangesAsync();
        
        objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
        await dbContext.SaveChangesAsync();
        
        objednavka.SetFaza(ObjednavkaFaza.VyrobaNemozna);
        objednavka.Zrusene = true;
        
        await dbContext.SaveChangesAsync();
    }
    
    
    private async Task CreateZrusenaNezaplatenaNaCas(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        int kontaktnaOsobaCount = firma.KontaktneOsoby.Count();
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(kontaktnaOsobaCount));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Objednávka zrušená - nezaplatená v termíne");
        SetPastDates(objednavka);

        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        
        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        
        objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        await dbContext.SaveChangesAsync();
        
        objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
        await dbContext.SaveChangesAsync();
        
        objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
        await dbContext.SaveChangesAsync();
        
        objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
        await dbContext.SaveChangesAsync();
        
        objednavka.SetFaza(ObjednavkaFaza.PlatbaCaka);
        await dbContext.SaveChangesAsync();
        
        
        objednavka.SetChybaKlienta(ChybaKlienta.NezaplatenaNaCas);
        objednavka.Zrusene = true;
        
        await dbContext.SaveChangesAsync();
    }
    
    
    private async Task CreateZrusenaPriVyrobe(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        int kontaktnaOsobaCount = firma.KontaktneOsoby.Count();
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(kontaktnaOsobaCount));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Objednávka zrušená klientom počas výroby");
        SetPastDates(objednavka);

        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        
        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        
        objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        await dbContext.SaveChangesAsync();
        
        objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
        await dbContext.SaveChangesAsync();
        
        
        if (_random.Next(2) == 0)
        {
            objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
        }
        else 
        {
            objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
            await dbContext.SaveChangesAsync();
            objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
        }
        await dbContext.SaveChangesAsync();
        
        
        objednavka.SetChybaKlienta(ChybaKlienta.ZrusenaPriVyrobe);
        objednavka.Zrusene = true;
        
        await dbContext.SaveChangesAsync();
    }
    
    
    private async Task CreateZrusenaKomunikacia(ApplicationDbContext dbContext, Firma firma, List<Tovar> tovary)
    {
        int kontaktnaOsobaCount = firma.KontaktneOsoby.Count();
        var kontaktnaOsoba = firma.KontaktneOsoby.ElementAt(_random.Next(kontaktnaOsobaCount));

        var objednavka = new Objednavka
        {
            Firma = firma,
            KontaktnaOsoba = kontaktnaOsoba
        };

        objednavka.SetPoznamka("Objednávka zrušená - zlá komunikácia s klientom");
        SetPastDates(objednavka);
        
        dbContext.Objednavky.Add(objednavka);
        await dbContext.SaveChangesAsync();

        
        var cenovaPonuka = CreateCenovaPonuka(objednavka, tovary);
        objednavka.AddCenovaPonuka(cenovaPonuka);
        
        
        objednavka.SetFaza(ObjednavkaFaza.NacenenieCaka);
        await dbContext.SaveChangesAsync();
        
        
        var possiblePhases = new[]
        {
            ObjednavkaFaza.VyrobaNeriesene,
            ObjednavkaFaza.VyrobaNemozna,
            ObjednavkaFaza.VyrobaCaka,
            ObjednavkaFaza.OdoslanieCaka,
            ObjednavkaFaza.PlatbaCaka
        };
        
        var targetPhase = possiblePhases[_random.Next(possiblePhases.Length)];
        
        
        switch (targetPhase)
        {
            case ObjednavkaFaza.VyrobaNeriesene:
                objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
                break;
                
            case ObjednavkaFaza.VyrobaNemozna:
                objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.VyrobaNemozna);
                break;
                
            case ObjednavkaFaza.VyrobaCaka:
                objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                break;
                
            case ObjednavkaFaza.OdoslanieCaka:
                objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
                break;
                
            case ObjednavkaFaza.PlatbaCaka:
                objednavka.SetFaza(ObjednavkaFaza.VyrobaNeriesene);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.VyrobaCaka);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.OdoslanieCaka);
                await dbContext.SaveChangesAsync();
                objednavka.SetFaza(ObjednavkaFaza.PlatbaCaka);
                break;
        }
        
        await dbContext.SaveChangesAsync();
        
        
        if (_random.Next(2) == 0)
        {
            objednavka.SetChybaKlienta(ChybaKlienta.ZlaKomunikacia);
        }
        else
        {
            objednavka.SetChybaKlienta(ChybaKlienta.InyProblem);
        }
        
        objednavka.Zrusene = true;
        await dbContext.SaveChangesAsync();
    }

    private CenovaPonuka CreateCenovaPonuka(Objednavka objednavka, List<Tovar> tovary)
    {
        var cenovaPonuka = new CenovaPonuka
        {
            Objednavka = objednavka
        };
        
        decimal celkovaPovodnaCena = 0;
        int itemCount = _random.Next(1, 5); 
            
        for (int i = 0; i < itemCount; i++)
        {
            var tovar = tovary[_random.Next(tovary.Count)];
            CenovaPonukaTovar cenovaPonukaTovar;
            decimal povodnaCenaPolozky;

            if (_random.Next(2) == 0 && tovar.Varianty.Any())
            {
                
                int variantCount = tovar.Varianty.Count();
                var variant = tovar.Varianty.ElementAt(_random.Next(variantCount));
                cenovaPonukaTovar = new CenovaPonukaTovar(tovar: tovar, variantTovar: variant) { Mnozstvo = _random.Next(1, 6) };
                povodnaCenaPolozky = variant.Cena;
                cenovaPonukaTovar.SetPovodnaCena(povodnaCenaPolozky); 
                cenovaPonuka.AddPolozka(cenovaPonukaTovar);
            }
            else
            {
                
                cenovaPonukaTovar = new CenovaPonukaTovar(tovar: tovar) { Mnozstvo = _random.Next(1, 6) };
                povodnaCenaPolozky = tovar.Cena;
                cenovaPonukaTovar.SetPovodnaCena(povodnaCenaPolozky); 
                cenovaPonuka.AddPolozka(cenovaPonukaTovar);
            }
            
            celkovaPovodnaCena += povodnaCenaPolozky * cenovaPonukaTovar.Mnozstvo;
        }

        
        double discountMultiplier = 1.0 - (_random.NextDouble() * 0.10); 
        decimal finalnaCena = celkovaPovodnaCena * (decimal)discountMultiplier;

        
        finalnaCena = Math.Max(0, finalnaCena); 
        
        cenovaPonuka.SetFinalnaCena(finalnaCena);
        
        return cenovaPonuka;
    }

    private ChybaKlienta GetRandomChybaKlienta()
    {
        var values = Enum.GetValues(typeof(ChybaKlienta));
        if (values.Length > 0)
        {
            return (ChybaKlienta)values.GetValue(_random.Next(values.Length))!;
        }
        return ChybaKlienta.InyProblem;
    }

    
    private void SetPastDates(Objednavka objednavka)
    {
        int daysAgo = _random.Next(1, 365);
        int manufacturingDaysAgo = daysAgo + _random.Next(5, 15); 
        
        objednavka.SetOcakavanyDatumDorucenia(DateTime.UtcNow.AddDays(-daysAgo));
        objednavka.NaplanovanyDatumVyroby = DateTime.UtcNow.AddDays(-manufacturingDaysAgo);
    }
} 
