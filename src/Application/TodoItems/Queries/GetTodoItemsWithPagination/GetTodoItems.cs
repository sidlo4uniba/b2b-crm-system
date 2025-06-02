using Plainquire.Filter;
using Plainquire.Page;
using Plainquire.Sort;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Application.Common.Mappings;
using CRMBackend.Application.Common.Models;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.TodoItems.Queries.GetTodoItemsWithPagination;

public record GetTodoItemsQuery : IRequest<IReadOnlyCollection<TodoItemBriefDto>>
{
    public required int ListId { get; init; }
    
    public required EntityFilter<TodoItem> Filter { get; init; }
    
    public required EntitySort<TodoItem> Sort { get; init; }
    
    public required EntityPage<TodoItem> Page { get; init; }
}

public class GetTodoItemsQueryHandler : IRequestHandler<GetTodoItemsQuery, IReadOnlyCollection<TodoItemBriefDto>>
{
    private readonly IReadRepository<TodoItem> _repository;
    private readonly IMapper _mapper;

    public GetTodoItemsQueryHandler(IReadRepository<TodoItem> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<TodoItemBriefDto>> Handle(GetTodoItemsQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetQueryableNoTracking()
            .Where(x => x.ListId == request.ListId)
            .Where(request.Filter)
            .OrderBy(request.Sort)
            .Page(request.Page)
            .OrderBy(x => x.Title)
            .ProjectTo<TodoItemBriefDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
