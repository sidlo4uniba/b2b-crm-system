using Microsoft.EntityFrameworkCore;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Common;
using System.Linq.Expressions;

namespace CRMBackend.Infrastructure.Data.Repositories
{
    public class WriteRepository<T> : IWriteRepository<T> where T : BaseEntity, IAggregateRoot
    {
        private readonly ApplicationDbContext _context;
        public WriteRepository(ApplicationDbContext context) => _context = context;

        public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _context.Set<T>().FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task<T?> GetByIdWithIncludesAsync(int id, Func<IQueryable<T>, IQueryable<T>> includeAction,
            CancellationToken cancellationToken)
        {
            IQueryable<T> query = _context.Set<T>();

            if (includeAction != null)
            {
                query = includeAction(query);
            }

            return await query.FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        }

        public void Add(T entity)
        {
            _context.Set<T>().Add(entity);
        }

        public void Delete(T entity)
        {
            _context.Set<T>().Remove(entity);
        }

        public async Task SaveAsync(CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
