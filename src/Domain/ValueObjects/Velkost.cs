using CRMBackend.Domain.Common;

namespace CRMBackend.Domain.ValueObjects;

public class Velkost(string code) : ValueObject
{
    public static Velkost From(string code)
    {
        var velkost = new Velkost(code);

        if (!SupportedValues.Contains(velkost))
        {
            throw new UnsupportedValueObjectException(typeof(Velkost).Name, code);
        }

        return velkost;
    }

    public static Velkost XS => new("XS");
    public static Velkost S => new("S");
    public static Velkost M => new("M");
    public static Velkost L => new("L");
    public static Velkost XL => new("XL");
    public static Velkost XXL => new("XXL");

    public string Code { get; private set; } = code;

    public static implicit operator string(Velkost velkost)
    {
        return velkost.ToString();
    }

    public static explicit operator Velkost(string code)
    {
        return From(code);
    }

    public override string ToString()
    {
        return Code;
    }

    protected static new IEnumerable<ValueObject> SupportedValues
    {
        get
        {
            yield return XS;
            yield return S;
            yield return M;
            yield return L;
            yield return XL;
            yield return XXL;
        }
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Code;
    }
} 