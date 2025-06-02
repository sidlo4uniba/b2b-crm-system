namespace CRMBackend.Domain.ValueObjects;

public class Colour(string code) : ValueObject
{
    public static Colour From(string code)
    {
        var colour = new Colour(code);

        if (!SupportedValues.Contains(colour))
        {
            throw new UnsupportedValueObjectException(typeof(Colour).Name, code);
        }

        return colour;
    }

    public static Colour White => new("#FFFFFF");
 
    public static Colour Red => new("#FF5733");

    public static Colour Orange => new("#FFC300");

    public static Colour Green => new("#CCFF99");

    public string Code { get; private set; } = string.IsNullOrWhiteSpace(code)?"#000000":code;

    public static implicit operator string(Colour colour)
    {
        return colour.ToString();
    }

    public static explicit operator Colour(string code)
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
            yield return White;
            yield return Red;
            yield return Orange;
            yield return Green;
        }
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Code;
    }
}
