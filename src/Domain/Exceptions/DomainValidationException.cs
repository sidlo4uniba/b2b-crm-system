﻿namespace CRMBackend.Domain.Exceptions;

public class DomainValidationException : Exception
{
    public DomainValidationException(string message)
        : base(message)
    {
    }
}
