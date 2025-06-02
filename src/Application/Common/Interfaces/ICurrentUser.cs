namespace CRMBackend.Application.Common.Interfaces;

public interface ICurrentUser
{
    string? Id { get; }
    string? FullName { get; }
    string? Username { get; }
    string? Email { get; }
    IEnumerable<string> Roles { get; }
    bool IsInRole(string role);
    bool IsAdmin { get; }
}
