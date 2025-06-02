using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.TovarAggregate;

[EntityFilter(Prefix = "")]
public class Tovar : BaseAuditableEntity, IAggregateRoot
{
    public required string InterneId { get; set; }
    public required string Nazov { get; set; }
    public string? ObrazokURL { get; private set; }
    public required KategoriaProduktu Kategoria { get; set; }
    public int KategoriaId { get; set; }
    public string? Ean { get; private set; }
    public required decimal Cena
    {
        get => _cena;
        set
        {
            if (value < 0)
                throw new DomainValidationException("Cena nemôže byť záporná");
            _cena = value;
        }
    }
    private decimal _cena;
    private Dodavatel? _dodavatel;
    public int DodavatelId { get; private set; }

    public required Dodavatel Dodavatel 
    { 
        get => _dodavatel ?? throw new DomainValidationException("Dodávateľ nie je nastavený.");
        set
        {
            if (_dodavatel != null)
                throw new DomainValidationException("Dodávateľa možno nastaviť iba raz pri vytvorení tovaru.");
            _dodavatel = value;
        }
    }

    private bool _aktivny = true;
    public bool Aktivny
    {
        get => _aktivny;
        set
        {
            if (_aktivny == value) return;

            _aktivny = value;

            foreach (var variant in _varianty)
            {
                variant.Aktivny = value;
            }
        }
    }

    private readonly List<VariantTovar> _varianty = new();
    public IEnumerable<VariantTovar> Varianty => _varianty.AsReadOnly();

    public void SetObrazok(string? obrazok)
    {
        ObrazokURL = obrazok;
    }

    public void SetEan(string? ean)
    {
        Ean = ean;
    }

    public void AddVariant(VariantTovar variant)
    {
        if (_varianty.Any(v => v.FarbaHex == variant.FarbaHex && Equals(v.Velkost, variant.Velkost)))
            throw new DomainValidationException("Duplicitná varianta");

        variant.Aktivny = this.Aktivny;

        _varianty.Add(variant);
    }

    public void RemoveVariant(int variantId)
    {
        var variant = _varianty.FirstOrDefault(v => v.Id == variantId);
        if (variant == null)
            throw new DomainValidationException("Varianta nebola nájdená");
        _varianty.Remove(variant);
    }
} 
