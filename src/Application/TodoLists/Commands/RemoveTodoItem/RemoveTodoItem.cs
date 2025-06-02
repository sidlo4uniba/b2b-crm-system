using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.TodoLists.Commands.RemoveTodoItem;

public record RemoveTodoItemCommand(int ListId, int ItemId) : IRequest;

public class RemoveTodoItemCommandHandler : IRequestHandler<RemoveTodoItemCommand>
{
    private readonly IWriteRepository<TodoList> _repository;

    public RemoveTodoItemCommandHandler(IWriteRepository<TodoList> repository)
    {
        _repository = repository;
    }

    public async Task Handle(RemoveTodoItemCommand request, CancellationToken cancellationToken)
    {
        var todoList = await _repository.GetByIdAsync(request.ListId, cancellationToken);
        Guard.Against.NotFound(request.ListId, todoList);

        todoList.RemoveItem(request.ItemId);
        await _repository.SaveAsync(cancellationToken);
    }
} 
