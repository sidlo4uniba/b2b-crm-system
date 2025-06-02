using AutoMapper;
using AutoMapper.QueryableExtensions;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Plainquire.Filter;
using Plainquire.Filter.Abstractions;
using Plainquire.Page;
using Plainquire.Page.Abstractions;
using Plainquire.Sort;
using Plainquire.Sort.Abstractions;
using System.Linq.Expressions;

namespace CRMBackend.Application.DodavatelAggregate.Queries.ListDodavatelia;

public record ListDodavateliaQuery : IRequest<PaginatedList<DodavatelDTO>>
{
    public required EntityFilter<Dodavatel> Filter { get; init; }
    public required EntitySort<Dodavatel> Sort { get; init; }
    public required EntityPage Page { get; init; }
    public string? Search { get; init; }
}

public class ListDodavateliaQueryHandler : IRequestHandler<ListDodavateliaQuery, PaginatedList<DodavatelDTO>>
{
    private readonly IReadRepository<Dodavatel> _readRepository;
    private readonly IMapper _mapper;

    public ListDodavateliaQueryHandler(IReadRepository<Dodavatel> readRepository, IMapper mapper)
    {
        _readRepository = readRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedList<DodavatelDTO>> Handle(ListDodavateliaQuery request, CancellationToken cancellationToken)
    {
        IQueryable<Dodavatel> query = _readRepository.GetQueryableNoTracking();

        query = query.Include(d => d.Adresa);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim().ToLower();

            query = query.Where(d =>
                (d.NazovFirmy != null && d.NazovFirmy.ToLower().Contains(searchTerm)) ||
                (d.Adresa != null && d.Adresa.Ulica != null && d.Adresa.Ulica.ToLower().Contains(searchTerm)) ||
                (d.Email != null && d.Email.ToLower().Contains(searchTerm)) ||
                (d.Telefon != null && d.Telefon.ToLower().Contains(searchTerm))
            );
        }

        var orderedQuery = query
            .Where(request.Filter)
            .OrderBy(request.Sort);

        var projectedQuery = orderedQuery.ProjectTo<DodavatelDTO>(_mapper.ConfigurationProvider);

        return await PaginatedList<DodavatelDTO>.CreateAsync(projectedQuery, request.Page, cancellationToken);
    }
}
