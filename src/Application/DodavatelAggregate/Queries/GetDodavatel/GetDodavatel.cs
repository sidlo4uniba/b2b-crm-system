using Ardalis.GuardClauses;
using AutoMapper;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.DodavatelAggregate.Queries.GetDodavatel;

public record GetDodavatelQuery : IRequest<DodavatelDetailDTO>
{
    public required int Id { get; init; }
}

public class GetDodavatelQueryHandler : IRequestHandler<GetDodavatelQuery, DodavatelDetailDTO>
{
    private readonly IReadRepository<Dodavatel> _readRepository;
    private readonly IMapper _mapper;

    public GetDodavatelQueryHandler(IReadRepository<Dodavatel> readRepository, IMapper mapper)
    {
        _readRepository = readRepository;
        _mapper = mapper;
    }

    public async Task<DodavatelDetailDTO> Handle(GetDodavatelQuery request, CancellationToken cancellationToken)
    {
        var dodavatel = await _readRepository.GetQueryableNoTracking()
            .Include(d => d.Tovary)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, dodavatel);

        return _mapper.Map<DodavatelDetailDTO>(dodavatel);
    }
} 
