using CRMBackend.Domain.Common;
using System.Linq.Expressions;

namespace CRMBackend.Application.Common.Interfaces.Repositories
{
    public interface IWriteRepository<T> where T : BaseEntity, IAggregateRoot
    {
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken);
        Task<T?> GetByIdWithIncludesAsync(int id, Func<IQueryable<T>, IQueryable<T>> includeAction, CancellationToken cancellationToken);
        void Add(T entity);
        void Delete(T entity);
        Task SaveAsync(CancellationToken cancellationToken);
    }
} 
