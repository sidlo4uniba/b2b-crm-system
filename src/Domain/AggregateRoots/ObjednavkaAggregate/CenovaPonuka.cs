using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;

[EntityFilter(Prefix = "")]
public class CenovaPonuka : BaseEntity
{
    public int ObjednavkaId { get; private set; }
    public required Objednavka Objednavka { get; set; }
    public decimal FinalnaCena { get; private set; }
    public StavCenovejPonuky Stav { get; private set; } = StavCenovejPonuky.Neriesene;

    private readonly List<CenovaPonukaTovar> _polozky = new();
    public IEnumerable<CenovaPonukaTovar> Polozky => _polozky.AsReadOnly();

    public void SetFinalnaCena(decimal cena)
    {
        if (cena < 0)
            throw new DomainValidationException("Finálna cena nemôže byť záporná.");
        if (Stav == StavCenovejPonuky.Schvalene)
            throw new DomainValidationException("Schválenú ponuku nemožno upraviť.");
        FinalnaCena = cena;
    }

    public void SetStav(StavCenovejPonuky novyStav)
    {
        if (Stav == StavCenovejPonuky.Schvalene && novyStav != StavCenovejPonuky.Schvalene)
            throw new DomainValidationException("Schválený stav nemožno zmeniť.");
        
        if (novyStav == StavCenovejPonuky.Poslane)
        {
            AktualizujPovodneCeny();
        }
        
        Stav = novyStav;
    }

    public void AddPolozka(CenovaPonukaTovar polozka)
    {
        if (Stav != StavCenovejPonuky.Neriesene)
            throw new DomainValidationException("Položky možno pridávať iba v stave Neriesene.");
        if (polozka.Tovar == null)
            throw new DomainValidationException("Vždy musí byť nastavený tovar.");
        _polozky.Add(polozka);
    }

    public void RemovePolozka(int polozkaId)
    {
        if (Stav != StavCenovejPonuky.Neriesene)
            throw new DomainValidationException("Položky možno odstraňovať iba v stave Neriesene.");
        var polozka = _polozky.FirstOrDefault(p => p.Id == polozkaId);
        if (polozka != null)
            _polozky.Remove(polozka);
    }

    public void AktualizujPovodneCeny()
    {
        if (Stav != StavCenovejPonuky.Neriesene)
            throw new DomainValidationException("Pôvodné ceny možno aktualizovať iba v stave Neriesene.");

        foreach (var polozka in _polozky)
        {
            if (polozka.Tovar != null)
            {
                polozka.SetPovodnaCena(polozka.Tovar.Cena);
            }
            else if (polozka.VariantTovar != null)
            {
                polozka.SetPovodnaCena(polozka.VariantTovar.Cena);
            }
        }
    }
}
