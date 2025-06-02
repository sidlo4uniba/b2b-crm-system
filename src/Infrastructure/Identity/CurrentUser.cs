using Microsoft.AspNetCore.Http;
using CRMBackend.Application.Common.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace CRMBackend.Infrastructure.Identity;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? Id => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    public string? FullName => _httpContextAccessor.HttpContext?.User?.FindFirst("name")?.Value;
    
    public string? Username => _httpContextAccessor.HttpContext?.User?.FindFirst("preferred_username")?.Value;
    
    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

    public IEnumerable<string> Roles => _httpContextAccessor.HttpContext?.User?
        .FindAll(ClaimTypes.Role)
        .Select(c => c.Value) ?? Enumerable.Empty<string>();

    public bool IsInRole(string role)
    {
        if (string.IsNullOrEmpty(role))
            return false;

        return Roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }

    public bool IsAdmin => IsInRole(Domain.Constants.Roles.Admin);
}
