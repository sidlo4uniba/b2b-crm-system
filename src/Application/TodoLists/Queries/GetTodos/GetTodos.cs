using Plainquire.Filter;
using Plainquire.Page;
using Plainquire.Sort;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Application.Common.Mappings;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.TodoLists.Queries.GetTodos;

public record GetTodosQuery : IRequest<IReadOnlyCollection<TodoListDto>>
{
    public required EntityFilter<TodoList> Filter { get; init; }
    public required EntitySort<TodoList> Sort { get; init; }
    public required EntityPage<TodoList> Page { get; init; }
}

public class GetTodosQueryHandler : IRequestHandler<GetTodosQuery, IReadOnlyCollection<TodoListDto>>
{
    private readonly IReadRepository<TodoList> _repository;
    private readonly IMapper _mapper;

    public GetTodosQueryHandler(IReadRepository<TodoList> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<TodoListDto>> Handle(GetTodosQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetQueryableNoTracking()
            .Where(request.Filter)
            .OrderBy(request.Sort)
            .Page(request.Page)
            .ProjectTo<TodoListDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
