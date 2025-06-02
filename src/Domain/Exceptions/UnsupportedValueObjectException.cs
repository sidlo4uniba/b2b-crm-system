namespace CRMBackend.Domain.Exceptions;

public class UnsupportedValueObjectException : Exception
{
    public UnsupportedValueObjectException(string valueObjectName, string value)
        : base($"Value \"{value}\" is unsupported for {valueObjectName}.")
    {
    }
} 