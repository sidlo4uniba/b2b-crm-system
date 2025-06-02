
namespace CRMBackend.Application.Common.Interfaces.Repositories
{
    public interface IReadRepository<T>
    {
        IQueryable<T> GetQueryableNoTracking();
    }
}
