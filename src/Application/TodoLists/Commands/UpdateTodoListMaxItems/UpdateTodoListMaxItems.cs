using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.Entities;
using MediatR;
using Ardalis.GuardClauses;

namespace CRMBackend.Application.TodoLists.Commands.UpdateTodoListMaxItems
{
    public record UpdateTodoListMaxItemsCommand : IRequest
    {
        public required int Id { get; init; }
        public required int MaxItems { get; init; }
    }

    public class UpdateTodoListMaxItemsCommandHandler : IRequestHandler<UpdateTodoListMaxItemsCommand>
    {
        private readonly IWriteRepository<TodoList> _repository;

        public UpdateTodoListMaxItemsCommandHandler(IWriteRepository<TodoList> repository)
        {
            _repository = repository;
        }

        public async Task Handle(UpdateTodoListMaxItemsCommand request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            Guard.Against.NotFound(request.Id, entity);

            entity.SetMaxItems(request.MaxItems);
            await _repository.SaveAsync(cancellationToken);
        }
    }
} 
