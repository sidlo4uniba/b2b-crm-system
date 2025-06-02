using AutoMapper;
using AutoMapper.QueryableExtensions;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Plainquire.Filter;
using Plainquire.Page;
using Plainquire.Sort;
using System.Linq.Expressions;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;

namespace CRMBackend.Application.Tovary.Queries.ListTovary;

public record ListTovaryQuery : IRequest<PaginatedList<TovarDTO>>
{
    public required EntityFilter<Tovar> Filter { get; init; }
    public required EntitySort<Tovar> Sort { get; init; }
    public required EntityPage Page { get; init; }
    public string? Search { get; init; }
}

public class ListTovaryQueryHandler : IRequestHandler<ListTovaryQuery, PaginatedList<TovarDTO>>
{
    private readonly IReadRepository<Tovar> _readRepository;
    private readonly IMapper _mapper;

    public ListTovaryQueryHandler(IReadRepository<Tovar> readRepository, IMapper mapper)
    {
        _readRepository = readRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedList<TovarDTO>> Handle(ListTovaryQuery request, CancellationToken cancellationToken)
    {
        IQueryable<Tovar> query = _readRepository.GetQueryableNoTracking();

        query = query
            .Include(t => t.Dodavatel)
                .ThenInclude(d => d!.Adresa);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim().ToLower();

            query = query.Where(t =>
                (t.Nazov != null && t.Nazov.ToLower().Contains(searchTerm)) ||
                (t.InterneId != null && t.InterneId.ToLower().Contains(searchTerm)) ||
                (t.Ean != null && t.Ean.ToLower().Contains(searchTerm)) ||
                (t.Dodavatel != null && t.Dodavatel.NazovFirmy != null && t.Dodavatel.NazovFirmy.ToLower().Contains(searchTerm)) ||
                (t.Dodavatel != null && t.Dodavatel.Adresa != null && t.Dodavatel.Adresa.Ulica != null && t.Dodavatel.Adresa.Ulica.ToLower().Contains(searchTerm)) ||
                (t.Dodavatel != null && t.Dodavatel.Email != null && t.Dodavatel.Email.ToLower().Contains(searchTerm)) ||
                (t.Dodavatel != null && t.Dodavatel.Telefon != null && t.Dodavatel.Telefon.ToLower().Contains(searchTerm))
            );
        }

        var orderedQuery = query
            .Where(request.Filter)
            .OrderBy(request.Sort);

        var projectedQuery = orderedQuery.ProjectTo<TovarDTO>(_mapper.ConfigurationProvider);

        return await PaginatedList<TovarDTO>.CreateAsync(projectedQuery, request.Page, cancellationToken);
    }
} 
