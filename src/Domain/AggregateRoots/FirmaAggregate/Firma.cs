using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.FirmaAggregate;

[EntityFilter(Prefix = "")]
public class Firma : BaseAuditableEntity, IAggregateRoot
{
    public required string Nazov { get; set; }
    public required string ICO { get; set; }
    public required Adresa Adresa { get; set; }
    public string? IcDph { get; private set; }
    public decimal SkoreSpolahlivosti { get; private set; } = 0;
    public decimal HodnotaObjednavok { get; private set; } = 0;
    private readonly List<KontaktnaOsoba> _kontaktneOsoby = new();
    public IEnumerable<KontaktnaOsoba> KontaktneOsoby => _kontaktneOsoby.AsReadOnly();
    private readonly List<Objednavka> _objednavky = new();
    public IEnumerable<Objednavka> Objednavky => _objednavky.AsReadOnly();

    public void SetIcDph(string? icDph)
    {
        IcDph = icDph;
    }

    public void UpdateSkoreSpolahlivosti(decimal newSkore)
    {
        if (newSkore < 0 || newSkore > 1)
            throw new DomainValidationException("Skóre spoľahlivosti musí byť medzi 0 a 1");
        SkoreSpolahlivosti = newSkore;
    }

    public void UpdateHodnotaObjednavok(decimal newHodnota)
    {
        if (newHodnota < 0)
            throw new DomainValidationException("Hodnota objednávok nemôže byť záporná");
        HodnotaObjednavok = newHodnota;
    }

    public void AddKontaktnaOsoba(KontaktnaOsoba osoba)
    {
        _kontaktneOsoby.Add(osoba);
    }

    public void RemoveKontaktnaOsoba(int kontaktnaOsobaId)
    {
        var osoba = _kontaktneOsoby.FirstOrDefault(o => o.Id == kontaktnaOsobaId);
        if (osoba == null)
            throw new DomainValidationException("Kontaktna osoba s danym ID neexistuje");

        _kontaktneOsoby.Remove(osoba);
    }

    public void AddObjednavka(Objednavka objednavka)
    {
        if (objednavka.FirmaId != Id)
            throw new DomainValidationException("Objednávka nepatrí tejto firme.");
        
        _objednavky.Add(objednavka);
        
        AddDomainEvent(new ObjednavkaVytvorenaEvent(Id, objednavka.VytvoreneDna.UtcDateTime));
    }

    public void RemoveObjednavka(int objednavkaId)
    {
        var objednavka = _objednavky.FirstOrDefault(o => o.Id == objednavkaId);
        if (objednavka == null)
            throw new DomainValidationException("Objednávka s daným ID neexistuje v rámci tejto firmy.");
        _objednavky.Remove(objednavka);
    }
} 
