using AutoMapper;
using AutoMapper.QueryableExtensions;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Plainquire.Filter;
using Plainquire.Filter.Abstractions;
using Plainquire.Page;
using Plainquire.Page.Abstractions;
using Plainquire.Sort;
using Plainquire.Sort.Abstractions;
using System.Linq.Expressions;

namespace CRMBackend.Application.FirmaAggregate.Queries.ListFirmy;

public record ListFirmyQuery : IRequest< PaginatedList<FirmaDTO> >
{
    public required EntityFilter<Firma> Filter { get; init; }
    public required EntitySort<Firma> Sort { get; init; }
    public required EntityPage Page { get; init; }
    public string? Search { get; init; }
}

public class ListFirmyQueryHandler : IRequestHandler< ListFirmyQuery, PaginatedList<FirmaDTO> >
{
    private readonly IReadRepository<Firma> _repository;
    private readonly IMapper _mapper;

    public ListFirmyQueryHandler(IReadRepository<Firma> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task< PaginatedList<FirmaDTO> > Handle(ListFirmyQuery request, CancellationToken cancellationToken)
    {
        IQueryable<Firma> query = _repository.GetQueryableNoTracking();

        query = query
            .Include(f => f.Adresa)
            .Include(f => f.KontaktneOsoby);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim().ToLower();

            query = query.Where(f =>
                (f.Nazov != null && f.Nazov.ToLower().Contains(searchTerm)) ||
                (f.ICO != null && f.ICO.ToLower().Contains(searchTerm)) ||
                (f.Adresa != null && f.Adresa.Ulica != null && f.Adresa.Ulica.ToLower().Contains(searchTerm)) ||
                (f.IcDph != null && f.IcDph.ToLower().Contains(searchTerm)) ||
                f.KontaktneOsoby.Any(ko =>
                    (ko.Meno != null && ko.Priezvisko != null && (ko.Meno + " " + ko.Priezvisko).ToLower().Contains(searchTerm)) ||
                    (ko.Email != null && ko.Email.ToLower().Contains(searchTerm)) ||
                    (ko.Telefon != null && ko.Telefon.ToLower().Contains(searchTerm))
                )
            );
        }

        var orderedQuery = query
            .Where(request.Filter)
            .OrderBy(request.Sort);

        var projectedQuery = orderedQuery.ProjectTo<FirmaDTO>(_mapper.ConfigurationProvider);

        return await PaginatedList<FirmaDTO>.CreateAsync(projectedQuery, request.Page, cancellationToken);
    }
}
