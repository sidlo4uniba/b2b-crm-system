using Ardalis.GuardClauses;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.GetObjednavka;

public record GetObjednavkaQuery : IRequest<ObjednavkaDetailDTO>
{
    public required int Id { get; init; }
}

public class GetObjednavkaQueryHandler : IRequestHandler<GetObjednavkaQuery, ObjednavkaDetailDTO>
{
    private readonly IReadRepository<Objednavka> _readRepository;
    private readonly IMapper _mapper;

    public GetObjednavkaQueryHandler(IReadRepository<Objednavka> readRepository, IMapper mapper)
    {
        _readRepository = readRepository;
        _mapper = mapper;
    }

    public async Task<ObjednavkaDetailDTO> Handle(GetObjednavkaQuery request, CancellationToken cancellationToken)
    {
        var objednavkaDto = await _readRepository.GetQueryableNoTracking()
            .Where(o => o.Id == request.Id)
            .Include(o => o.CenovePonuky) 
            .ProjectTo<ObjednavkaDetailDTO>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, objednavkaDto);

        return objednavkaDto;
    }
} 
