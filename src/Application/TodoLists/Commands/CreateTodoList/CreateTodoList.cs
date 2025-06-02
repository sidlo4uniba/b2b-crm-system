using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;
using CRMBackend.Domain.Enums;
using CRMBackend.Domain.ValueObjects;
using MediatR;

namespace CRMBackend.Application.TodoLists.Commands.CreateTodoList;

public record CreateTodoListCommand : IRequest<int>
{
    public required string Title { get; init; }
    public string? Description { get; init; }
    public Colour? Colour { get; init; }
    public int? MaxItems { get; init; }
}

public class CreateTodoListCommandHandler : IRequestHandler<CreateTodoListCommand, int>
{
    private readonly IWriteRepository<TodoList> _repository;

    public CreateTodoListCommandHandler(IWriteRepository<TodoList> repository)
    {
        _repository = repository;
    }

    public async Task<int> Handle(CreateTodoListCommand request, CancellationToken cancellationToken)
    {
        var entity = new TodoList
        {
            Title = request.Title
        };

        if (request.Description is not null)
            entity.SetDescription(request.Description);

        if (request.Colour is not null)
            entity.SetColour(request.Colour);

        if (request.MaxItems.HasValue)
            entity.SetMaxItems(request.MaxItems.Value);

        _repository.Add(entity);
        await _repository.SaveAsync(cancellationToken);

        return entity.Id;
    }
}
