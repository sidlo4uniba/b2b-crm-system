using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.DodavatelAggregate;

[EntityFilter(Prefix = "")]
public class Dodavatel : BaseAuditableEntity, IAggregateRoot
{
    public required string NazovFirmy { get; set; }
    public required string Email { get; set; }
    public required string Telefon { get; set; }
    public Adresa? Adresa { get; private set; }
    public string? Poznamka { get; private set; }
    
    private bool _aktivny = true;
    public bool Aktivny
    {
        get => _aktivny;
        set
        {
            if (_aktivny == value) return;

            _aktivny = value;

            foreach (var tovar in _tovary)
            {
                tovar.Aktivny = value;
            }
        }
    }
    
    private readonly List<Tovar> _tovary = new();
    public IEnumerable<Tovar> Tovary => _tovary.AsReadOnly();

    public void SetAdresa(Adresa? adresa)
    {
        Adresa = adresa;
    }

    public void SetPoznamka(string? poznamka)
    {
        Poznamka = poznamka;
    }

    public void AddTovar(Tovar tovar)
    {
        tovar.Aktivny = this.Aktivny;
        _tovary.Add(tovar);
    }

    public void RemoveTovar(int tovarId)
    {
        var tovar = _tovary.FirstOrDefault(t => t.Id == tovarId);
        if (tovar == null)
            throw new DomainValidationException("Tovar s daným ID neexistuje v rámci tohto dodávateľa.");
        _tovary.Remove(tovar);
    }
} 
