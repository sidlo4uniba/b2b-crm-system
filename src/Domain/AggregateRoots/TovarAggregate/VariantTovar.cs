using Plainquire.Filter.Abstractions;

namespace CRMBackend.Domain.AggregateRoots.TovarAggregate;

[EntityFilter(Prefix = "")]
public class VariantTovar : BaseEntity
{
    public required Tovar Tovar { get; set; }
    public int TovarId { get; set; }
    public string? FarbaHex { get; private set; }
    public Velkost? Velkost { get; private set; }
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
    public string? ObrazokURL { get; private set; }
    public bool Aktivny { get; set; } = true;

    // Private parameterless constructor for EF Core
    private VariantTovar() { }

    public VariantTovar(string? farba, Velkost? velkost)
    {
        SetFarbaVelkost(farba, velkost);
    }

    public void SetFarbaVelkost(string? farba, Velkost? velkost)
    {
        if (string.IsNullOrEmpty(farba) && velkost == null)
            throw new DomainValidationException("Aspoň jedna z hodnôt Farba alebo Veľkosť musí byť nastavená");

        if (!string.IsNullOrEmpty(farba) && !IsValidHexColor(farba))
            throw new DomainValidationException("Farba musí byť platný hexadecimálny kód farby");

        if (farba != null)
            farba = farba.ToUpper();
        
        FarbaHex = farba;
        Velkost = velkost;
    }

    public void SetCena(decimal cena)
    {
        if (cena < 0)
            throw new DomainValidationException("Cena nemôže byť záporná");
        Cena = cena;
    }

    public void SetObrazok(string? obrazok)
    {
        ObrazokURL = obrazok;
    }

    private static bool IsValidHexColor(string color)
    {
        return System.Text.RegularExpressions.Regex.IsMatch(color, @"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
    }
} 
