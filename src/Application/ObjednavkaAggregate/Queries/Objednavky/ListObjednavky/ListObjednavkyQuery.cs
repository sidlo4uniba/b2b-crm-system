using AutoMapper;
using AutoMapper.QueryableExtensions;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Plainquire.Filter;
using Plainquire.Filter.Abstractions;
using Plainquire.Page;
using Plainquire.Page.Abstractions;
using Plainquire.Sort;
using Plainquire.Sort.Abstractions;
using System.Linq.Expressions;

namespace CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.ListObjednavky;

public record ListObjednavkyQuery : IRequest<PaginatedList<ObjednavkaDTO>>
{
    public required EntityFilter<Objednavka> Filter { get; init; }
    public required EntitySort<Objednavka> Sort { get; init; }
    public required EntityPage Page { get; init; }
    public string? Search { get; init; }
}

public class ListObjednavkyQueryHandler : IRequestHandler<ListObjednavkyQuery, PaginatedList<ObjednavkaDTO>>
{
    private readonly IReadRepository<Objednavka> _readRepository;
    private readonly IMapper _mapper;

    public ListObjednavkyQueryHandler(IReadRepository<Objednavka> readRepository, IMapper mapper)
    {
        _readRepository = readRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedList<ObjednavkaDTO>> Handle(ListObjednavkyQuery request, CancellationToken cancellationToken)
    {
        IQueryable<Objednavka> query = _readRepository.GetQueryableNoTracking();

        query = query
            .Include(o => o.Firma)
                .ThenInclude(f => f!.Adresa)
            .Include(o => o.KontaktnaOsoba);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim().ToLower();

            query = query.Where(o =>
                (o.Firma != null && o.Firma.Nazov != null && o.Firma.Nazov.ToLower().Contains(searchTerm)) ||
                (o.Firma != null && o.Firma.ICO != null && o.Firma.ICO.ToLower().Contains(searchTerm)) ||
                (o.Firma != null && o.Firma.Adresa != null && o.Firma.Adresa.Ulica != null && o.Firma.Adresa.Ulica.ToLower().Contains(searchTerm)) ||
                (o.Firma != null && o.Firma.IcDph != null && o.Firma.IcDph.ToLower().Contains(searchTerm)) ||
                (o.KontaktnaOsoba != null && o.KontaktnaOsoba.Meno != null && o.KontaktnaOsoba.Priezvisko != null && (o.KontaktnaOsoba.Meno + " " + o.KontaktnaOsoba.Priezvisko).ToLower().Contains(searchTerm)) ||
                (o.KontaktnaOsoba != null && o.KontaktnaOsoba.Email != null && o.KontaktnaOsoba.Email.ToLower().Contains(searchTerm)) ||
                (o.KontaktnaOsoba != null && o.KontaktnaOsoba.Telefon != null && o.KontaktnaOsoba.Telefon.ToLower().Contains(searchTerm))
            );
        }

        var orderedQuery = query
            .Where(request.Filter)
            .OrderBy(request.Sort);

        var projectedQuery = orderedQuery.ProjectTo<ObjednavkaDTO>(_mapper.ConfigurationProvider);

        return await PaginatedList<ObjednavkaDTO>.CreateAsync(projectedQuery, request.Page, cancellationToken);
    }
} 
