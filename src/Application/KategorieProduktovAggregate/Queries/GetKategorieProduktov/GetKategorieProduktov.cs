using AutoMapper;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.KategorieProduktovAggregate.Queries.GetKategorieProduktov;

public record GetKategorieProduktovQuery : IRequest<List<KategorieProduktovDto>>;

public class GetKategorieProduktovQueryHandler : IRequestHandler<GetKategorieProduktovQuery, List<KategorieProduktovDto>>
{
    private readonly IReadRepository<KategoriaProduktu> _repository;
    private readonly IMapper _mapper;

    public GetKategorieProduktovQueryHandler(IReadRepository<KategoriaProduktu> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<List<KategorieProduktovDto>> Handle(GetKategorieProduktovQuery request, CancellationToken cancellationToken)
    {
        var kategorie = await _repository.GetQueryableNoTracking()
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<KategorieProduktovDto>>(kategorie);
    }
} 