using CRMBackend.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CRMBackend.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Net;

namespace CRMBackend.Web.Infrastructure;

public static class PostgresErrorCodes
{
    public const string ForeignKeyViolation = "23503";
    public const string UniqueViolation = "23505";
}


public class CustomExceptionHandler : IExceptionHandler
{
    private readonly ILogger<CustomExceptionHandler> _logger;
    private readonly IHostEnvironment _environment;
    private readonly Dictionary<Type, Func<HttpContext, Exception, Task>> _exceptionHandlers;

    public CustomExceptionHandler(ILogger<CustomExceptionHandler> logger, IHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
        _exceptionHandlers = new()
            {
                { typeof(ValidationException), HandleValidationException },
                { typeof(DomainValidationException), HandleDomainValidationException },
                { typeof(NotFoundException), HandleNotFoundException },
                { typeof(UnauthorizedAccessException), HandleUnauthorizedAccessException },
                { typeof(ForbiddenAccessException), HandleForbiddenAccessException },
            };
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is DbUpdateException dbUpdateEx && dbUpdateEx.InnerException is PostgresException postgresEx)
        {
             if (postgresEx.SqlState == PostgresErrorCodes.ForeignKeyViolation)
             {
                 _logger.LogWarning(dbUpdateEx, "Handling Foreign Key Violation (SqlState: {SqlState})", postgresEx.SqlState);
                 await HandleForeignKeyViolationException(httpContext, postgresEx);
                 return true;
             }
             else if (postgresEx.SqlState == PostgresErrorCodes.UniqueViolation)
             {
                 _logger.LogWarning(dbUpdateEx, "Handling Unique Constraint Violation (SqlState: {SqlState})", postgresEx.SqlState);
                 await HandleUniqueConstraintViolationException(httpContext, postgresEx);
                 return true;
             }
        }

        var exceptionType = exception.GetType();

        if (_exceptionHandlers.ContainsKey(exceptionType))
        {
            _logger.LogWarning(exception, "Handling known exception type: {ExceptionType}", exceptionType.Name);
            await _exceptionHandlers[exceptionType].Invoke(httpContext, exception);
            return true;
        }

        _logger.LogError(exception, "Unhandled exception occurred: {ExceptionType}", exceptionType.Name);
        return false;
    }

    private async Task HandleValidationException(HttpContext httpContext, Exception ex)
    {
        var exception = (ValidationException)ex;

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

        await httpContext.Response.WriteAsJsonAsync(new ValidationProblemDetails(exception.Errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1"
        });
    }

    private async Task HandleDomainValidationException(HttpContext httpContext, Exception ex)
    {
        var exception = (DomainValidationException)ex;

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

        var errors = new Dictionary<string, string[]>
        {
            { exception.Source ?? "DomainValidation", new[] { exception.Message } }
        };

        await httpContext.Response.WriteAsJsonAsync(new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Domain Rule Violation"
        });
    }

    private async Task HandleNotFoundException(HttpContext httpContext, Exception ex)
    {
        var exception = (NotFoundException)ex;

        httpContext.Response.StatusCode = StatusCodes.Status404NotFound;

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails()
        {
            Status = StatusCodes.Status404NotFound,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            Title = "The specified resource was not found.",
            Detail = exception.Message
        });
    }

    private async Task HandleUnauthorizedAccessException(HttpContext httpContext, Exception ex)
    {
        httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status401Unauthorized,
            Title = "Unauthorized",
            Detail = "Authentication is required to access this resource.",
            Type = "https://tools.ietf.org/html/rfc7235#section-3.1"
        });
    }

    private async Task HandleForbiddenAccessException(HttpContext httpContext, Exception ex)
    {
        httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status403Forbidden,
            Title = "Forbidden",
            Detail = "You do not have permission to perform this action.",
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3"
        });
    }

    private async Task HandleForeignKeyViolationException(HttpContext httpContext, PostgresException exception)
    {
        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "Data Conflict",
            Detail = "The operation could not be completed because it conflicts with existing data. This often happens when trying to delete an item that is still referenced by other records.",
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8"
        };

        if (_environment.IsDevelopment())
        {
            problemDetails.Extensions.Add("databaseError", $"Constraint: {exception.ConstraintName}. Details: {exception.MessageText}");
        }

        await httpContext.Response.WriteAsJsonAsync(problemDetails);
    }

    private async Task HandleUniqueConstraintViolationException(HttpContext httpContext, PostgresException exception)
    {
         httpContext.Response.StatusCode = StatusCodes.Status409Conflict;

         var problemDetails = new ProblemDetails
         {
             Status = StatusCodes.Status409Conflict,
             Title = "Data Conflict",
             Detail = "The operation could not be completed because an item with the same unique identifier or value already exists.",
             Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8"
         };

         if (_environment.IsDevelopment())
         {
             problemDetails.Extensions.Add("databaseError", $"Constraint: {exception.ConstraintName}. Details: {exception.MessageText}");
         }

         await httpContext.Response.WriteAsJsonAsync(problemDetails);
    }
}
