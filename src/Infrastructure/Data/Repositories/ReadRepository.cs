using Microsoft.EntityFrameworkCore;
using CRMBackend.Application.Common.Interfaces.Repositories;

namespace CRMBackend.Infrastructure.Data.Repositories
{
    public class ReadRepository<T> : IReadRepository<T> where T : class
    {
        private readonly ApplicationDbContext _context;

        public ReadRepository(ApplicationDbContext context) => _context = context;

        public IQueryable<T> GetQueryableNoTracking()
        {
            return _context.Set<T>().AsNoTracking();
        }
    }
} 
