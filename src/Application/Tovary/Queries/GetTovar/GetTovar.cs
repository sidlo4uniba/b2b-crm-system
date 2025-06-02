using CRMBackend.Application.Common.Interfaces.Repositories;

namespace CRMBackend.Application.Tovary.Queries.GetTovar;

public record GetTovarQuery : IRequest<TovarDetailDTO>
{
    public required int Id { get; init; }
}

public class GetTovarQueryHandler : IRequestHandler<GetTovarQuery, TovarDetailDTO>
{
    private readonly IReadRepository<Domain.AggregateRoots.TovarAggregate.Tovar> _readRepository;
    private readonly IMapper _mapper;

    public GetTovarQueryHandler(IReadRepository<Domain.AggregateRoots.TovarAggregate.Tovar> readRepository, IMapper mapper)
    {
        _readRepository = readRepository;
        _mapper = mapper;
    }

    public async Task<TovarDetailDTO> Handle(GetTovarQuery request, CancellationToken cancellationToken)
    {
        var tovar = await _readRepository.GetQueryableNoTracking()
            .Where(t => t.Id == request.Id)
            .ProjectTo<TovarDetailDTO>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, tovar);

        return tovar;
    }
} 
