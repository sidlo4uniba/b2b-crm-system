using Microsoft.EntityFrameworkCore;
using Plainquire.Page;
using Plainquire.Page.Abstractions;

namespace CRMBackend.Application.Common.Models;

public class PaginatedList<T>
{
    public IReadOnlyCollection<T> Items { get; }
    
    public int PageNumber { get; }
    
    public int TotalPages { get; }
    
    public int TotalCount { get; }

    private PaginatedList(IReadOnlyCollection<T> items, int totalCount, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        TotalCount = totalCount;
        Items = items;
    }
    
    public bool HasPreviousPage => PageNumber > 1;
    
    public bool HasNextPage => PageNumber < TotalPages;
    
    public static async Task< PaginatedList<T> > CreateAsync(IQueryable<T> source, EntityPage page, CancellationToken cancellationToken = default)
    {
        int pageNumber = page.PageNumber ?? 1;
        int pageSize = page.PageSize ?? 50;

        if(pageNumber < 1)
            pageNumber = 1;

        if(pageSize < 1)
            pageSize = 1;

        var count = await source.CountAsync(cancellationToken);
        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PaginatedList<T>(items, count, pageNumber, pageSize);
    }
} 
