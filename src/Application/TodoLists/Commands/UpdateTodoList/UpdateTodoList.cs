using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;
using CRMBackend.Domain.ValueObjects;
using MediatR;
using Ardalis.GuardClauses;

namespace CRMBackend.Application.TodoLists.Commands.UpdateTodoList;

public record UpdateTodoListCommand : IRequest
{
    public required int Id { get; init; }
    public required string Title { get; init; }
    public Colour? Colour { get; init; }
}

public class UpdateTodoListCommandHandler : IRequestHandler<UpdateTodoListCommand>
{
    private readonly IWriteRepository<TodoList> _repository;

    public UpdateTodoListCommandHandler(IWriteRepository<TodoList> repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateTodoListCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        Guard.Against.NotFound(request.Id, entity);

        entity.Title = request.Title;
        
        if (request.Colour is not null)
        {
            entity.SetColour(request.Colour);
        }


        await _repository.SaveAsync(cancellationToken);
    }
}
