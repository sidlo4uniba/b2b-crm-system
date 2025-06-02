using CRMBackend.Application.Common.Interfaces;
using CRMBackend.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CRMBackend.Infrastructure.Data.Interceptors;

public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly TimeProvider _dateTime;
    private readonly ICurrentUser _currentUser;

    public AuditableEntityInterceptor(
        TimeProvider dateTime,
        ICurrentUser currentUser)
    {
        _dateTime = dateTime;
        _currentUser = currentUser;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public void UpdateEntities(DbContext? context)
    {
        if (context == null) return;

        foreach (var entry in context.ChangeTracker.Entries<BaseAuditableEntity>())
        {
            if (entry.State is EntityState.Added or EntityState.Modified || entry.HasChangedOwnedEntities())
            {
                var utcNow = _dateTime.GetUtcNow();
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.VytvoreneDna = utcNow;
                    entry.Entity.VytvorilUzivatel = _currentUser.FullName;
                }
                entry.Entity.UpraveneDna = utcNow;
                entry.Entity.UpravilUzivatel = _currentUser.FullName;
            }
        }
    }
}

public static class Extensions
{
    public static bool HasChangedOwnedEntities(this EntityEntry entry) =>
        entry.References.Any(r => 
            r.TargetEntry != null && 
            r.TargetEntry.Metadata.IsOwned() && 
            (r.TargetEntry.State == EntityState.Added || r.TargetEntry.State == EntityState.Modified));
}
