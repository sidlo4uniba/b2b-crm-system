using Ardalis.GuardClauses;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.FirmaAggregate.Queries.GetFirma;

public record GetFirmaQuery : IRequest<FirmaDetailDTO>
{
    public required int Id { get; init; }
}

public class GetFirmaQueryHandler : IRequestHandler< GetFirmaQuery, FirmaDetailDTO >
{
    private readonly IReadRepository<Firma> _repository;
    private readonly IMapper _mapper;

    public GetFirmaQueryHandler(IReadRepository<Firma> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<FirmaDetailDTO> Handle(GetFirmaQuery request, CancellationToken cancellationToken)
    {
        var firma = await _repository.GetQueryableNoTracking()
            .Where(f => f.Id == request.Id)
            .Include(f => f.KontaktneOsoby)
            .Include(f => f.Objednavky)
            .ProjectTo<FirmaDetailDTO>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, firma);

        return firma;
    }
} 
