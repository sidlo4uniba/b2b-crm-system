using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Application.TodoLists.Commands.DeleteTodoList;

public record DeleteTodoListCommand(int Id) : IRequest;

public class DeleteTodoListCommandHandler : IRequestHandler<DeleteTodoListCommand>
{
    private readonly IWriteRepository<TodoList> _repository;

    public DeleteTodoListCommandHandler(IWriteRepository<TodoList> repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteTodoListCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        Guard.Against.NotFound(request.Id, entity);

        _repository.Delete(entity);
        await _repository.SaveAsync(cancellationToken);
    }
}
